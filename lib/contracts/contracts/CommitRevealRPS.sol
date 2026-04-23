// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Commit-Reveal Rock-Paper-Scissors (v3)
/// @notice A two-player RPS game that hides moves with keccak256 commitments
///         until both players have committed, preventing front-running.
///         v3 adds a configurable protocol fee taken from the winning pot only
///         (ties and cancellations are fee-free), routed to a treasury.
contract CommitRevealRPS {
    enum Move {
        None,
        Rock,
        Paper,
        Scissors
    }

    enum Phase {
        Empty,
        WaitingForOpponent,
        WaitingForReveals,
        Resolved,
        Refunded,
        Cancelled
    }

    struct Game {
        address player1;
        address player2;
        uint256 bet;
        bytes32 commitment1;
        bytes32 commitment2;
        Move move1;
        Move move2;
        Phase phase;
        address winner;
        uint64 joinedAt;
    }

    /// @notice Players have this long after `joinGame` to reveal before the
    ///         no-show can be slashed.
    uint256 public constant REVEAL_TIMEOUT = 24 hours;

    /// @notice Hard cap on the protocol fee. Owner can never set above this.
    uint16 public constant MAX_FEE_BPS = 500; // 5%

    uint256 public nextGameId;
    mapping(uint256 => Game) private games;
    uint256[] private openGameIds;
    mapping(uint256 => uint256) private openGameIndex;
    mapping(uint256 => bool) private isOpen;

    // ----- Ownership / treasury -----
    address public owner;
    address public feeRecipient;
    /// @notice Fee taken from the winning pot, in basis points (100 = 1%).
    uint16 public feeBps;
    /// @notice Total fees collected lifetime (running total, not balance).
    uint256 public totalFeesCollected;
    /// @notice Total fees withdrawn lifetime.
    uint256 public totalFeesWithdrawn;

    event GameCreated(uint256 indexed gameId, address indexed player1, uint256 bet);
    event GameJoined(uint256 indexed gameId, address indexed player2, uint64 deadline);
    event GameCancelled(uint256 indexed gameId, address indexed player1, uint256 refund);
    event MoveRevealed(uint256 indexed gameId, address indexed player, Move move);
    event GameResolved(uint256 indexed gameId, address indexed winner, uint256 payout, uint256 fee);
    event GameTied(uint256 indexed gameId, uint256 refundEach);
    event GameClaimedByDefault(uint256 indexed gameId, address indexed winner, uint256 payout, uint256 fee);
    event FeeCollected(uint256 indexed gameId, uint256 amount);
    event FeesWithdrawn(address indexed to, uint256 amount);
    event FeeBpsUpdated(uint16 oldBps, uint16 newBps);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    error InvalidGame();
    error WrongPhase();
    error WrongBet();
    error NotAPlayer();
    error NotPlayer1();
    error AlreadyRevealed();
    error InvalidMove();
    error CommitmentMismatch();
    error CannotJoinOwnGame();
    error DeadlineNotPassed();
    error AlreadyRevealedYourMove();
    error OpponentAlsoRevealed();
    error NotOwner();
    error FeeTooHigh();
    error ZeroAddress();
    error NothingToWithdraw();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address _feeRecipient, uint16 _feeBps) {
        if (_feeRecipient == address(0)) revert ZeroAddress();
        if (_feeBps > MAX_FEE_BPS) revert FeeTooHigh();
        owner = msg.sender;
        feeRecipient = _feeRecipient;
        feeBps = _feeBps;
        emit OwnershipTransferred(address(0), msg.sender);
        emit FeeRecipientUpdated(address(0), _feeRecipient);
        emit FeeBpsUpdated(0, _feeBps);
    }

    /// @notice Create a new game with a hidden move and a bet.
    /// @param commitment keccak256(abi.encode(msg.sender, move, salt))
    function createGame(bytes32 commitment) external payable returns (uint256 gameId) {
        require(commitment != bytes32(0), "Empty commitment");

        gameId = nextGameId++;
        Game storage g = games[gameId];
        g.player1 = msg.sender;
        g.bet = msg.value;
        g.commitment1 = commitment;
        g.phase = Phase.WaitingForOpponent;

        openGameIndex[gameId] = openGameIds.length;
        openGameIds.push(gameId);
        isOpen[gameId] = true;

        emit GameCreated(gameId, msg.sender, msg.value);
    }

    /// @notice Cancel an unjoined game and refund player1.
    function cancelGame(uint256 gameId) external {
        Game storage g = games[gameId];
        if (g.player1 == address(0)) revert InvalidGame();
        if (g.phase != Phase.WaitingForOpponent) revert WrongPhase();
        if (msg.sender != g.player1) revert NotPlayer1();

        g.phase = Phase.Cancelled;
        _removeFromOpen(gameId);

        uint256 refund = g.bet;
        if (refund > 0) {
            _payout(g.player1, refund);
        }
        emit GameCancelled(gameId, g.player1, refund);
    }

    /// @notice Join an existing game by matching the bet and posting your commitment.
    function joinGame(uint256 gameId, bytes32 commitment) external payable {
        Game storage g = games[gameId];
        if (g.player1 == address(0)) revert InvalidGame();
        if (g.phase != Phase.WaitingForOpponent) revert WrongPhase();
        if (msg.value != g.bet) revert WrongBet();
        if (msg.sender == g.player1) revert CannotJoinOwnGame();
        require(commitment != bytes32(0), "Empty commitment");

        g.player2 = msg.sender;
        g.commitment2 = commitment;
        g.phase = Phase.WaitingForReveals;
        g.joinedAt = uint64(block.timestamp);

        _removeFromOpen(gameId);

        emit GameJoined(gameId, msg.sender, uint64(block.timestamp + REVEAL_TIMEOUT));
    }

    /// @notice Reveal your move and salt. When both players have revealed, the
    ///         game is resolved automatically.
    function reveal(uint256 gameId, Move move, bytes32 salt) external {
        Game storage g = games[gameId];
        if (g.player1 == address(0)) revert InvalidGame();
        if (g.phase != Phase.WaitingForReveals) revert WrongPhase();
        if (move != Move.Rock && move != Move.Paper && move != Move.Scissors) {
            revert InvalidMove();
        }

        bytes32 expected = keccak256(abi.encode(msg.sender, move, salt));

        if (msg.sender == g.player1) {
            if (g.move1 != Move.None) revert AlreadyRevealed();
            if (expected != g.commitment1) revert CommitmentMismatch();
            g.move1 = move;
        } else if (msg.sender == g.player2) {
            if (g.move2 != Move.None) revert AlreadyRevealed();
            if (expected != g.commitment2) revert CommitmentMismatch();
            g.move2 = move;
        } else {
            revert NotAPlayer();
        }

        emit MoveRevealed(gameId, msg.sender, move);

        if (g.move1 != Move.None && g.move2 != Move.None) {
            _resolve(gameId);
        }
    }

    /// @notice After REVEAL_TIMEOUT, the player who already revealed can claim
    ///         the entire pot if their opponent never revealed.
    function claimByDefault(uint256 gameId) external {
        Game storage g = games[gameId];
        if (g.player1 == address(0)) revert InvalidGame();
        if (g.phase != Phase.WaitingForReveals) revert WrongPhase();
        if (block.timestamp < uint256(g.joinedAt) + REVEAL_TIMEOUT) {
            revert DeadlineNotPassed();
        }

        bool isP1 = msg.sender == g.player1;
        bool isP2 = msg.sender == g.player2;
        if (!isP1 && !isP2) revert NotAPlayer();

        if (isP1) {
            if (g.move1 == Move.None) revert AlreadyRevealedYourMove();
            if (g.move2 != Move.None) revert OpponentAlsoRevealed();
        } else {
            if (g.move2 == Move.None) revert AlreadyRevealedYourMove();
            if (g.move1 != Move.None) revert OpponentAlsoRevealed();
        }

        g.phase = Phase.Resolved;
        g.winner = msg.sender;
        uint256 pot = g.bet * 2;
        (uint256 payout, uint256 fee) = _splitPot(pot);
        if (payout > 0) {
            _payout(msg.sender, payout);
        }
        if (fee > 0) {
            totalFeesCollected += fee;
            emit FeeCollected(gameId, fee);
        }
        emit GameClaimedByDefault(gameId, msg.sender, payout, fee);
    }

    function _resolve(uint256 gameId) internal {
        Game storage g = games[gameId];
        address winner = _winnerOf(g.move1, g.move2, g.player1, g.player2);

        if (winner == address(0)) {
            g.phase = Phase.Refunded;
            uint256 refund = g.bet;
            if (refund > 0) {
                _payout(g.player1, refund);
                _payout(g.player2, refund);
            }
            emit GameTied(gameId, refund);
        } else {
            g.phase = Phase.Resolved;
            g.winner = winner;
            uint256 pot = g.bet * 2;
            (uint256 payout, uint256 fee) = _splitPot(pot);
            if (payout > 0) {
                _payout(winner, payout);
            }
            if (fee > 0) {
                totalFeesCollected += fee;
                emit FeeCollected(gameId, fee);
            }
            emit GameResolved(gameId, winner, payout, fee);
        }
    }

    function _splitPot(uint256 pot) internal view returns (uint256 payout, uint256 fee) {
        if (pot == 0 || feeBps == 0) return (pot, 0);
        fee = (pot * feeBps) / 10_000;
        payout = pot - fee;
    }

    function _winnerOf(Move m1, Move m2, address p1, address p2) internal pure returns (address) {
        if (m1 == m2) return address(0);
        if (
            (m1 == Move.Rock && m2 == Move.Scissors) ||
            (m1 == Move.Paper && m2 == Move.Rock) ||
            (m1 == Move.Scissors && m2 == Move.Paper)
        ) {
            return p1;
        }
        return p2;
    }

    function _payout(address to, uint256 amount) internal {
        (bool ok, ) = payable(to).call{value: amount}("");
        require(ok, "Payout failed");
    }

    function _removeFromOpen(uint256 gameId) internal {
        if (!isOpen[gameId]) return;
        uint256 idx = openGameIndex[gameId];
        uint256 lastIdx = openGameIds.length - 1;
        if (idx != lastIdx) {
            uint256 lastId = openGameIds[lastIdx];
            openGameIds[idx] = lastId;
            openGameIndex[lastId] = idx;
        }
        openGameIds.pop();
        delete openGameIndex[gameId];
        isOpen[gameId] = false;
    }

    // ----- Owner / treasury controls -----

    function setFeeBps(uint16 newBps) external onlyOwner {
        if (newBps > MAX_FEE_BPS) revert FeeTooHigh();
        emit FeeBpsUpdated(feeBps, newBps);
        feeBps = newBps;
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert ZeroAddress();
        emit FeeRecipientUpdated(feeRecipient, newRecipient);
        feeRecipient = newRecipient;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /// @notice Withdraw the accrued protocol fees to the fee recipient.
    ///         Anyone can call this — funds always go to feeRecipient.
    function withdrawFees() external {
        uint256 available = totalFeesCollected - totalFeesWithdrawn;
        if (available == 0) revert NothingToWithdraw();
        totalFeesWithdrawn += available;
        _payout(feeRecipient, available);
        emit FeesWithdrawn(feeRecipient, available);
    }

    // ----- Views -----

    function getGame(uint256 gameId) external view returns (Game memory) {
        return games[gameId];
    }

    function getOpenGames() external view returns (uint256[] memory) {
        return openGameIds;
    }

    function openGamesCount() external view returns (uint256) {
        return openGameIds.length;
    }

    /// @notice Returns the unix timestamp by which both players must reveal,
    ///         or 0 if the game isn't in the reveal phase.
    function revealDeadline(uint256 gameId) external view returns (uint256) {
        Game storage g = games[gameId];
        if (g.phase != Phase.WaitingForReveals) return 0;
        return uint256(g.joinedAt) + REVEAL_TIMEOUT;
    }

    /// @notice The amount the winner of a given game would actually receive
    ///         (pot minus the protocol fee at the time of resolution).
    function winnerPayout(uint256 gameId) external view returns (uint256 payout, uint256 fee) {
        Game storage g = games[gameId];
        return _splitPot(g.bet * 2);
    }

    /// @notice Fees collected but not yet withdrawn.
    function pendingFees() external view returns (uint256) {
        return totalFeesCollected - totalFeesWithdrawn;
    }

    /// @notice Helper for off-chain code: computes the commitment the same way
    ///         the contract verifies it. Frontends should compute this locally
    ///         to keep the salt secret.
    function computeCommitment(address player, Move move, bytes32 salt) external pure returns (bytes32) {
        return keccak256(abi.encode(player, move, salt));
    }
}
