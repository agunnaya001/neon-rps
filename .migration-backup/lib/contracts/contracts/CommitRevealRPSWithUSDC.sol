// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

error InvalidCommitment();
error InvalidReveal();
error GameNotFound();
error GameAlreadyRevealed();
error RevealWindowClosed();
error InvalidMove();
error InsufficientAllowance();
error TransferFailed();

contract CommitRevealRPSWithUSDC is ReentrancyGuard, Ownable {
    enum Move {
        NONE,
        ROCK,
        PAPER,
        SCISSORS
    }

    enum GameStatus {
        PENDING_REVEAL,
        COMPLETED,
        DEFAULT_WIN
    }

    struct Game {
        address player1;
        address player2;
        bytes32 player1Commitment;
        bytes32 player2Commitment;
        Move player1Move;
        Move player2Move;
        address winner;
        uint256 wagerAmount;
        address wagerToken; // ETH (address(0)) or USDC
        uint256 createdAt;
        uint256 revealDeadline;
        GameStatus status;
        bool player1Revealed;
        bool player2Revealed;
    }

    address public constant ETH_ADDRESS = address(0);
    address public USDC_ADDRESS;
    uint256 public constant MAX_FEE_BPS = 500; // 5%
    uint256 public feeBps = 250; // 2.5%
    uint256 public treasury;
    address public feeRecipient;

    mapping(bytes32 => Game) public games;
    mapping(address => uint256) public pendingPayouts;

    event GameCreated(
        bytes32 indexed gameHash,
        address player1,
        address player2,
        uint256 wagerAmount,
        address wagerToken
    );
    event GameRevealed(
        bytes32 indexed gameHash,
        address player,
        Move move
    );
    event GameCompleted(
        bytes32 indexed gameHash,
        address winner,
        uint256 prizeAmount
    );
    event ReferralEarned(
        address indexed referrer,
        uint256 amount,
        bytes32 gameHash
    );

    constructor(address _usdc, address _feeRecipient) {
        USDC_ADDRESS = _usdc;
        feeRecipient = _feeRecipient;
    }

    // Create game with ETH wager
    function createGame(
        bytes32 player1Commitment,
        address player2,
        uint256 wagerAmount
    ) external payable returns (bytes32) {
        return _createGame(player1Commitment, player2, wagerAmount, ETH_ADDRESS);
    }

    // Create game with USDC wager
    function createGameWithUSDC(
        bytes32 player1Commitment,
        address player2,
        uint256 wagerAmount
    ) external returns (bytes32) {
        // Transfer USDC from player1 to this contract
        bool success = IERC20(USDC_ADDRESS).transferFrom(
            msg.sender,
            address(this),
            wagerAmount
        );
        if (!success) revert TransferFailed();

        return _createGame(player1Commitment, player2, wagerAmount, USDC_ADDRESS);
    }

    function _createGame(
        bytes32 player1Commitment,
        address player2,
        uint256 wagerAmount,
        address wagerToken
    ) internal returns (bytes32) {
        if (player1Commitment == bytes32(0)) revert InvalidCommitment();
        if (wagerAmount == 0) revert InvalidCommitment();

        bytes32 gameHash = keccak256(
            abi.encodePacked(msg.sender, player2, block.timestamp)
        );

        Game storage game = games[gameHash];
        game.player1 = msg.sender;
        game.player2 = player2;
        game.player1Commitment = player1Commitment;
        game.wagerAmount = wagerAmount;
        game.wagerToken = wagerToken;
        game.createdAt = block.timestamp;
        game.revealDeadline = block.timestamp + 24 hours;
        game.status = GameStatus.PENDING_REVEAL;

        emit GameCreated(gameHash, msg.sender, player2, wagerAmount, wagerToken);

        return gameHash;
    }

    // Reveal move
    function reveal(
        bytes32 gameHash,
        Move move,
        bytes32 salt
    ) external nonReentrant {
        if (move == Move.NONE || move == Move.ROCK || move == Move.PAPER || move == Move.SCISSORS) {
            // Valid moves
        } else {
            revert InvalidMove();
        }

        Game storage game = games[gameHash];
        if (game.player1 == address(0)) revert GameNotFound();
        if (block.timestamp > game.revealDeadline) revert RevealWindowClosed();

        // Verify commitment
        bytes32 commitment = keccak256(abi.encodePacked(move, salt, msg.sender));

        if (msg.sender == game.player1) {
            if (game.player1Revealed) revert GameAlreadyRevealed();
            if (commitment != game.player1Commitment) revert InvalidReveal();
            game.player1Move = move;
            game.player1Revealed = true;
        } else if (msg.sender == game.player2) {
            if (game.player2Revealed) revert GameAlreadyRevealed();
            if (commitment != game.player2Commitment) revert InvalidReveal();
            game.player2Move = move;
            game.player2Revealed = true;
        } else {
            revert InvalidReveal();
        }

        emit GameRevealed(gameHash, msg.sender, move);

        // If both revealed, resolve game
        if (game.player1Revealed && game.player2Revealed) {
            _resolveGame(gameHash);
        }
    }

    // Claim by default if opponent doesn't reveal
    function claimByDefault(bytes32 gameHash) external {
        Game storage game = games[gameHash];
        if (game.player1 == address(0)) revert GameNotFound();
        if (block.timestamp <= game.revealDeadline) revert RevealWindowClosed();

        address claimer = msg.sender;
        if (claimer != game.player1 && claimer != game.player2) {
            revert InvalidReveal();
        }

        if (game.status == GameStatus.COMPLETED) revert GameAlreadyRevealed();

        // Award to the player who revealed
        if (game.player1Revealed && !game.player2Revealed && claimer == game.player1) {
            game.winner = game.player1;
            game.status = GameStatus.DEFAULT_WIN;
            _payout(gameHash);
        } else if (game.player2Revealed && !game.player1Revealed && claimer == game.player2) {
            game.winner = game.player2;
            game.status = GameStatus.DEFAULT_WIN;
            _payout(gameHash);
        } else {
            revert InvalidReveal();
        }
    }

    function _resolveGame(bytes32 gameHash) internal {
        Game storage game = games[gameHash];

        // Determine winner
        Move p1 = game.player1Move;
        Move p2 = game.player2Move;

        if (p1 == p2) {
            // Draw - both get their wagers back
            pendingPayouts[game.player1] += game.wagerAmount;
            pendingPayouts[game.player2] += game.wagerAmount;
            game.status = GameStatus.COMPLETED;
        } else if (
            (p1 == Move.ROCK && p2 == Move.SCISSORS) ||
            (p1 == Move.PAPER && p2 == Move.ROCK) ||
            (p1 == Move.SCISSORS && p2 == Move.PAPER)
        ) {
            game.winner = game.player1;
            game.status = GameStatus.COMPLETED;
            _payout(gameHash);
        } else {
            game.winner = game.player2;
            game.status = GameStatus.COMPLETED;
            _payout(gameHash);
        }
    }

    function _payout(bytes32 gameHash) internal {
        Game storage game = games[gameHash];
        uint256 totalWager = game.wagerAmount * 2;
        uint256 fee = (totalWager * feeBps) / 10000;
        uint256 prizeAmount = totalWager - fee;

        treasury += fee;
        pendingPayouts[game.winner] += prizeAmount;

        emit GameCompleted(gameHash, game.winner, prizeAmount);
    }

    function claim() external nonReentrant {
        uint256 amount = pendingPayouts[msg.sender];
        if (amount == 0) revert InvalidCommitment();

        pendingPayouts[msg.sender] = 0;

        // Determine which token to send
        address token = ETH_ADDRESS;
        
        if (token == ETH_ADDRESS) {
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            bool success = IERC20(token).transfer(msg.sender, amount);
            if (!success) revert TransferFailed();
        }
    }

    // Admin functions
    function setFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= MAX_FEE_BPS, "Fee too high");
        feeBps = newFeeBps;
    }

    function withdrawTreasury() external onlyOwner nonReentrant {
        uint256 amount = treasury;
        treasury = 0;
        (bool success, ) = payable(feeRecipient).call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    receive() external payable {}
}
