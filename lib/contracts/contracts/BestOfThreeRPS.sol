// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title BestOfThreeRPS (v1)
/// @notice Two-player best-of-3 Rock-Paper-Scissors series using commit-reveal.
///         Both players stake once; first to 2 round-wins claims the pot.
///         Fee (max 5%) taken from the winning payout on completion only.
///         Cancelled series and ties within a round carry no fee.
contract BestOfThreeRPS {

    enum Move { None, Rock, Paper, Scissors }

    enum Phase {
        Empty,
        WaitingForOpponent,  // Created by P1, waiting for P2
        Committing,          // Rounds 2/3: waiting for both new commitments
        Revealing,           // Both committed — waiting for reveals
        Completed            // Series decided, pot paid
    }

    struct Series {
        address player1;
        address player2;
        uint256 bet;
        uint8 wins1;
        uint8 wins2;
        uint8 currentRound;      // 1, 2, or 3
        Phase phase;
        uint64 roundStartedAt;   // when Revealing phase began (for default-claim timeout)
        // Current-round state (reset between rounds)
        bytes32 commit1;
        bytes32 commit2;
        bool committed1;
        bool committed2;
        bool revealed1;
        bool revealed2;
        Move move1;
        Move move2;
    }

    uint256 public constant REVEAL_TIMEOUT = 24 hours;
    uint16  public constant MAX_FEE_BPS    = 500; // 5%

    uint256 public nextSeriesId;
    mapping(uint256 => Series) private series;

    address public owner;
    address public feeRecipient;
    uint16  public feeBps;
    uint256 public pendingFees;
    uint256 public totalFeesCollected;
    uint256 public totalFeesWithdrawn;

    // ── Events ──────────────────────────────────────────────────────────────
    event SeriesCreated(uint256 indexed seriesId, address indexed player1, uint256 bet);
    event SeriesJoined(uint256 indexed seriesId, address indexed player2);
    event RoundCommitted(uint256 indexed seriesId, uint8 round, address indexed player);
    event RoundResolved(uint256 indexed seriesId, uint8 round, uint8 roundWinner, uint8 score1, uint8 score2);
    event SeriesCompleted(uint256 indexed seriesId, address indexed winner, uint256 payout);
    event SeriesCancelled(uint256 indexed seriesId);
    event FeeCollected(uint256 indexed seriesId, uint256 amount);
    event FeesWithdrawn(address indexed to, uint256 amount);
    event FeeBpsUpdated(uint16 oldBps, uint16 newBps);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    // ── Errors ───────────────────────────────────────────────────────────────
    error InvalidCommitment();
    error InvalidMove();
    error WrongPhase();
    error WrongPlayer();
    error BetMismatch();
    error AlreadyCommitted();
    error AlreadyRevealed();
    error CommitmentMismatch();
    error TimeoutNotReached();
    error BothOrNeitherRevealed();
    error NotCancellable();
    error NotOwner();
    error FeeTooHigh();
    error ZeroAddress();
    error NothingToWithdraw();
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address _feeRecipient, uint16 _feeBps) {
        if (_feeRecipient == address(0)) revert ZeroAddress();
        if (_feeBps > MAX_FEE_BPS) revert FeeTooHigh();
        feeRecipient = _feeRecipient;
        feeBps = _feeBps;
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
        emit FeeRecipientUpdated(address(0), _feeRecipient);
        emit FeeBpsUpdated(0, _feeBps);
    }

    // ── Game functions ────────────────────────────────────────────────────────

    /// @notice Create a series and commit your move for round 1.
    /// @param commitment keccak256(abi.encode(msg.sender, move, salt))
    function createSeries(bytes32 commitment) external payable returns (uint256 id) {
        if (commitment == bytes32(0)) revert InvalidCommitment();
        if (msg.value == 0) revert BetMismatch();
        id = nextSeriesId++;
        Series storage s = series[id];
        s.player1 = msg.sender;
        s.bet = msg.value;
        s.currentRound = 1;
        s.phase = Phase.WaitingForOpponent;
        s.commit1 = commitment;
        s.committed1 = true;
        emit SeriesCreated(id, msg.sender, msg.value);
    }

    /// @notice Join an open series and commit your move for round 1.
    function joinSeries(uint256 id, bytes32 commitment) external payable {
        Series storage s = series[id];
        if (s.phase != Phase.WaitingForOpponent) revert WrongPhase();
        if (msg.sender == s.player1) revert WrongPlayer();
        if (msg.value != s.bet) revert BetMismatch();
        if (commitment == bytes32(0)) revert InvalidCommitment();
        s.player2 = msg.sender;
        s.commit2 = commitment;
        s.committed2 = true;
        s.phase = Phase.Revealing;
        s.roundStartedAt = uint64(block.timestamp);
        emit SeriesJoined(id, msg.sender);
    }

    /// @notice Submit your commitment for rounds 2 or 3. Both must commit before either reveals.
    function commitRound(uint256 id, bytes32 commitment) external {
        Series storage s = series[id];
        if (s.phase != Phase.Committing) revert WrongPhase();
        if (commitment == bytes32(0)) revert InvalidCommitment();

        bool isP1 = msg.sender == s.player1;
        bool isP2 = msg.sender == s.player2;
        if (!isP1 && !isP2) revert WrongPlayer();

        if (isP1) {
            if (s.committed1) revert AlreadyCommitted();
            s.commit1 = commitment;
            s.committed1 = true;
        } else {
            if (s.committed2) revert AlreadyCommitted();
            s.commit2 = commitment;
            s.committed2 = true;
        }

        emit RoundCommitted(id, s.currentRound, msg.sender);

        if (s.committed1 && s.committed2) {
            s.phase = Phase.Revealing;
            s.roundStartedAt = uint64(block.timestamp);
        }
    }

    /// @notice Reveal your move for the current round. Auto-resolves when both reveal.
    function reveal(uint256 id, Move move, bytes32 salt) external {
        Series storage s = series[id];
        if (s.phase != Phase.Revealing) revert WrongPhase();
        if (move == Move.None || uint8(move) > 3) revert InvalidMove();

        bool isP1 = msg.sender == s.player1;
        bool isP2 = msg.sender == s.player2;
        if (!isP1 && !isP2) revert WrongPlayer();

        bytes32 expected = keccak256(abi.encode(msg.sender, move, salt));

        if (isP1) {
            if (s.revealed1) revert AlreadyRevealed();
            if (expected != s.commit1) revert CommitmentMismatch();
            s.move1 = move;
            s.revealed1 = true;
        } else {
            if (s.revealed2) revert AlreadyRevealed();
            if (expected != s.commit2) revert CommitmentMismatch();
            s.move2 = move;
            s.revealed2 = true;
        }

        if (s.revealed1 && s.revealed2) {
            _resolveRound(id);
        }
    }

    /// @notice Cancel a series no one has joined yet (creator only, full refund).
    function cancelSeries(uint256 id) external {
        Series storage s = series[id];
        if (s.phase != Phase.WaitingForOpponent) revert NotCancellable();
        if (msg.sender != s.player1) revert WrongPlayer();
        s.phase = Phase.Empty;
        uint256 refund = s.bet;
        s.bet = 0;
        emit SeriesCancelled(id);
        (bool ok,) = s.player1.call{value: refund}("");
        if (!ok) revert TransferFailed();
    }

    /// @notice Claim the pot if opponent has not revealed within REVEAL_TIMEOUT.
    ///         The revealing player must have already revealed; the other must not have.
    function claimByDefault(uint256 id) external {
        Series storage s = series[id];
        if (s.phase != Phase.Revealing) revert WrongPhase();
        if (block.timestamp < s.roundStartedAt + REVEAL_TIMEOUT) revert TimeoutNotReached();
        if (s.revealed1 == s.revealed2) revert BothOrNeitherRevealed();

        address winner = s.revealed1 ? s.player1 : s.player2;
        if (msg.sender != winner) revert WrongPlayer();

        s.phase = Phase.Completed;
        uint256 pot = s.bet * 2;
        uint256 fee = (pot * feeBps) / 10000;
        uint256 payout = pot - fee;

        if (fee > 0) {
            pendingFees += fee;
            totalFeesCollected += fee;
            emit FeeCollected(id, fee);
        }

        emit SeriesCompleted(id, winner, payout);
        (bool ok,) = winner.call{value: payout}("");
        if (!ok) revert TransferFailed();
    }

    // ── Treasury ──────────────────────────────────────────────────────────────

    /// @notice Withdraw all pending fees to feeRecipient. Anyone can call.
    function withdrawFees() external {
        uint256 amount = pendingFees;
        if (amount == 0) revert NothingToWithdraw();
        pendingFees = 0;
        totalFeesWithdrawn += amount;
        emit FeesWithdrawn(feeRecipient, amount);
        (bool ok,) = feeRecipient.call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    // ── Owner ────────────────────────────────────────────────────────────────

    function setFeeBps(uint16 _feeBps) external onlyOwner {
        if (_feeBps > MAX_FEE_BPS) revert FeeTooHigh();
        emit FeeBpsUpdated(feeBps, _feeBps);
        feeBps = _feeBps;
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        if (_feeRecipient == address(0)) revert ZeroAddress();
        emit FeeRecipientUpdated(feeRecipient, _feeRecipient);
        feeRecipient = _feeRecipient;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // ── Views ────────────────────────────────────────────────────────────────

    function getSeries(uint256 id) external view returns (
        address player1, address player2, uint256 bet,
        uint8 wins1, uint8 wins2, uint8 currentRound,
        Phase phase, uint64 roundStartedAt,
        bool committed1, bool committed2,
        bool revealed1, bool revealed2
    ) {
        Series storage s = series[id];
        return (
            s.player1, s.player2, s.bet,
            s.wins1, s.wins2, s.currentRound,
            s.phase, s.roundStartedAt,
            s.committed1, s.committed2,
            s.revealed1, s.revealed2
        );
    }

    function revealDeadline(uint256 id) external view returns (uint256) {
        Series storage s = series[id];
        if (s.phase != Phase.Revealing) return 0;
        return s.roundStartedAt + REVEAL_TIMEOUT;
    }

    function winnerPayout(uint256 id) external view returns (uint256) {
        Series storage s = series[id];
        uint256 pot = s.bet * 2;
        uint256 fee = (pot * feeBps) / 10000;
        return pot - fee;
    }

    // ── Internal ─────────────────────────────────────────────────────────────

    function _resolveRound(uint256 id) internal {
        Series storage s = series[id];
        Move m1 = s.move1;
        Move m2 = s.move2;

        uint8 roundWinner; // 0 = tie, 1 = player1, 2 = player2
        if (m1 == m2) {
            roundWinner = 0;
        } else if (
            (m1 == Move.Rock     && m2 == Move.Scissors) ||
            (m1 == Move.Paper    && m2 == Move.Rock)     ||
            (m1 == Move.Scissors && m2 == Move.Paper)
        ) {
            roundWinner = 1;
            s.wins1 += 1;
        } else {
            roundWinner = 2;
            s.wins2 += 1;
        }

        emit RoundResolved(id, s.currentRound, roundWinner, s.wins1, s.wins2);

        // Series decided?
        if (s.wins1 >= 2 || s.wins2 >= 2) {
            address winner = s.wins1 >= 2 ? s.player1 : s.player2;
            s.phase = Phase.Completed;
            uint256 pot = s.bet * 2;
            uint256 fee = (pot * feeBps) / 10000;
            uint256 payout = pot - fee;

            if (fee > 0) {
                pendingFees += fee;
                totalFeesCollected += fee;
                emit FeeCollected(id, fee);
            }

            emit SeriesCompleted(id, winner, payout);
            (bool ok,) = winner.call{value: payout}("");
            if (!ok) revert TransferFailed();

        } else {
            // Reset round state for next round
            s.currentRound += 1;
            s.commit1 = bytes32(0);
            s.commit2 = bytes32(0);
            s.committed1 = false;
            s.committed2 = false;
            s.revealed1 = false;
            s.revealed2 = false;
            s.move1 = Move.None;
            s.move2 = Move.None;
            s.phase = Phase.Committing;
        }
    }
}
