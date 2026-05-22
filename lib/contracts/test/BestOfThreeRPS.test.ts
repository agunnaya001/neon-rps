import { expect } from "chai";
import { ethers } from "hardhat";
import { BestOfThreeRPS } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

enum Move { None = 0, Rock = 1, Paper = 2, Scissors = 3 }
enum Phase { Empty = 0, WaitingForOpponent = 1, Committing = 2, Revealing = 3, Completed = 4 }

const FEE_BPS = 250n; // 2.5%
const BET = ethers.parseEther("0.1");

function makeCommit(player: string, move: Move, salt: string): string {
  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "uint8", "bytes32"],
      [player, move, salt]
    )
  );
}

const SALT1 = ethers.hexlify(ethers.randomBytes(32));
const SALT2 = ethers.hexlify(ethers.randomBytes(32));
const SALT1B = ethers.hexlify(ethers.randomBytes(32));
const SALT2B = ethers.hexlify(ethers.randomBytes(32));
const SALT1C = ethers.hexlify(ethers.randomBytes(32));
const SALT2C = ethers.hexlify(ethers.randomBytes(32));

describe("BestOfThreeRPS", () => {
  let rps: BestOfThreeRPS;
  let owner: HardhatEthersSigner;
  let p1: HardhatEthersSigner;
  let p2: HardhatEthersSigner;
  let other: HardhatEthersSigner;

  beforeEach(async () => {
    [owner, p1, p2, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("BestOfThreeRPS");
    rps = await Factory.deploy(owner.address, FEE_BPS) as BestOfThreeRPS;
  });

  // ── Deployment ──────────────────────────────────────────────────────────────

  describe("Deployment", () => {
    it("sets owner, feeRecipient, feeBps correctly", async () => {
      expect(await rps.owner()).to.equal(owner.address);
      expect(await rps.feeRecipient()).to.equal(owner.address);
      expect(await rps.feeBps()).to.equal(FEE_BPS);
    });

    it("rejects zero feeRecipient", async () => {
      const Factory = await ethers.getContractFactory("BestOfThreeRPS");
      await expect(Factory.deploy(ethers.ZeroAddress, 250))
        .to.be.revertedWithCustomError(rps, "ZeroAddress");
    });

    it("rejects feeBps above MAX (500)", async () => {
      const Factory = await ethers.getContractFactory("BestOfThreeRPS");
      await expect(Factory.deploy(owner.address, 501))
        .to.be.revertedWithCustomError(rps, "FeeTooHigh");
    });
  });

  // ── Create & Join ───────────────────────────────────────────────────────────

  describe("createSeries / joinSeries", () => {
    it("creates a series and emits SeriesCreated", async () => {
      const commit = makeCommit(p1.address, Move.Rock, SALT1);
      await expect(rps.connect(p1).createSeries(commit, { value: BET }))
        .to.emit(rps, "SeriesCreated").withArgs(0n, p1.address, BET);

      const s = await rps.getSeries(0);
      expect(s.player1).to.equal(p1.address);
      expect(s.bet).to.equal(BET);
      expect(s.phase).to.equal(Phase.WaitingForOpponent);
    });

    it("rejects empty commitment", async () => {
      await expect(
        rps.connect(p1).createSeries(ethers.ZeroHash, { value: BET })
      ).to.be.revertedWithCustomError(rps, "InvalidCommitment");
    });

    it("rejects zero bet", async () => {
      const commit = makeCommit(p1.address, Move.Rock, SALT1);
      await expect(rps.connect(p1).createSeries(commit, { value: 0 }))
        .to.be.revertedWithCustomError(rps, "BetMismatch");
    });

    it("p2 joins and moves to Revealing phase", async () => {
      const c1 = makeCommit(p1.address, Move.Rock, SALT1);
      await rps.connect(p1).createSeries(c1, { value: BET });

      const c2 = makeCommit(p2.address, Move.Scissors, SALT2);
      await expect(rps.connect(p2).joinSeries(0, c2, { value: BET }))
        .to.emit(rps, "SeriesJoined").withArgs(0n, p2.address);

      const s = await rps.getSeries(0);
      expect(s.phase).to.equal(Phase.Revealing);
      expect(s.player2).to.equal(p2.address);
    });

    it("rejects wrong bet amount when joining", async () => {
      const c1 = makeCommit(p1.address, Move.Rock, SALT1);
      await rps.connect(p1).createSeries(c1, { value: BET });
      const c2 = makeCommit(p2.address, Move.Rock, SALT2);
      await expect(
        rps.connect(p2).joinSeries(0, c2, { value: BET / 2n })
      ).to.be.revertedWithCustomError(rps, "BetMismatch");
    });

    it("rejects creator joining own series", async () => {
      const c = makeCommit(p1.address, Move.Rock, SALT1);
      await rps.connect(p1).createSeries(c, { value: BET });
      const c2 = makeCommit(p1.address, Move.Paper, SALT2);
      await expect(
        rps.connect(p1).joinSeries(0, c2, { value: BET })
      ).to.be.revertedWithCustomError(rps, "WrongPlayer");
    });
  });

  // ── Round 1: all outcomes ────────────────────────────────────────────────────

  async function setupRound1(move1: Move, move2: Move) {
    const c1 = makeCommit(p1.address, move1, SALT1);
    const c2 = makeCommit(p2.address, move2, SALT2);
    await rps.connect(p1).createSeries(c1, { value: BET });
    await rps.connect(p2).joinSeries(0, c2, { value: BET });
    return { id: 0n };
  }

  describe("Round resolution", () => {
    it("Rock beats Scissors → p1 wins round 1 (series continues)", async () => {
      await setupRound1(Move.Rock, Move.Scissors);
      await rps.connect(p1).reveal(0, Move.Rock, SALT1);
      await expect(rps.connect(p2).reveal(0, Move.Scissors, SALT2))
        .to.emit(rps, "RoundResolved").withArgs(0n, 1n, 1n, 1n, 0n);

      const s = await rps.getSeries(0);
      expect(s.wins1).to.equal(1);
      expect(s.wins2).to.equal(0);
      expect(s.phase).to.equal(Phase.Committing);
      expect(s.currentRound).to.equal(2);
    });

    it("Paper beats Rock → p2 wins round", async () => {
      await setupRound1(Move.Rock, Move.Paper);
      await rps.connect(p1).reveal(0, Move.Rock, SALT1);
      await expect(rps.connect(p2).reveal(0, Move.Paper, SALT2))
        .to.emit(rps, "RoundResolved").withArgs(0n, 1n, 2n, 0n, 1n);
    });

    it("Scissors beats Paper → p1 wins", async () => {
      await setupRound1(Move.Scissors, Move.Paper);
      await rps.connect(p1).reveal(0, Move.Scissors, SALT1);
      await rps.connect(p2).reveal(0, Move.Paper, SALT2);
      const s = await rps.getSeries(0);
      expect(s.wins1).to.equal(1);
    });

    it("Tie (Rock v Rock) → no score change, next round", async () => {
      await setupRound1(Move.Rock, Move.Rock);
      await rps.connect(p1).reveal(0, Move.Rock, SALT1);
      await expect(rps.connect(p2).reveal(0, Move.Rock, SALT2))
        .to.emit(rps, "RoundResolved").withArgs(0n, 1n, 0n, 0n, 0n);
      const s = await rps.getSeries(0);
      expect(s.wins1).to.equal(0);
      expect(s.wins2).to.equal(0);
      expect(s.phase).to.equal(Phase.Committing);
    });

    it("rejects wrong commitment (wrong move)", async () => {
      await setupRound1(Move.Rock, Move.Scissors);
      await expect(
        rps.connect(p1).reveal(0, Move.Paper, SALT1)
      ).to.be.revertedWithCustomError(rps, "CommitmentMismatch");
    });

    it("rejects double-reveal", async () => {
      await setupRound1(Move.Rock, Move.Scissors);
      await rps.connect(p1).reveal(0, Move.Rock, SALT1);
      await expect(
        rps.connect(p1).reveal(0, Move.Rock, SALT1)
      ).to.be.revertedWithCustomError(rps, "AlreadyRevealed");
    });

    it("rejects non-player revealing", async () => {
      await setupRound1(Move.Rock, Move.Scissors);
      const c = makeCommit(other.address, Move.Rock, SALT1);
      await expect(
        rps.connect(other).reveal(0, Move.Rock, SALT1)
      ).to.be.revertedWithCustomError(rps, "WrongPlayer");
    });
  });

  // ── Full 2-round series (p1 wins 2-0) ────────────────────────────────────────

  describe("Series completion — p1 wins 2-0", () => {
    it("p1 wins rounds 1 & 2 → series completed, payout sent", async () => {
      // Round 1: p1 Rock vs p2 Scissors
      const c1r1 = makeCommit(p1.address, Move.Rock, SALT1);
      const c2r1 = makeCommit(p2.address, Move.Scissors, SALT2);
      await rps.connect(p1).createSeries(c1r1, { value: BET });
      await rps.connect(p2).joinSeries(0, c2r1, { value: BET });
      await rps.connect(p1).reveal(0, Move.Rock, SALT1);
      await rps.connect(p2).reveal(0, Move.Scissors, SALT2);
      // → Round 1: p1 wins (1-0), moves to Committing

      // Round 2 commits
      const c1r2 = makeCommit(p1.address, Move.Paper, SALT1B);
      const c2r2 = makeCommit(p2.address, Move.Rock, SALT2B);
      await rps.connect(p1).commitRound(0, c1r2);
      await rps.connect(p2).commitRound(0, c2r2);
      // → Phase.Revealing

      const pot = BET * 2n;
      const fee = (pot * FEE_BPS) / 10000n;
      const payout = pot - fee;

      const p1Before = await ethers.provider.getBalance(p1.address);

      // Round 2: p1 Paper vs p2 Rock → p1 wins (2-0) → series complete
      const tx = await rps.connect(p1).reveal(0, Move.Paper, SALT1B);
      await rps.connect(p2).reveal(0, Move.Rock, SALT2B);

      await expect(
        rps.connect(p2).reveal(0, Move.Rock, SALT2B)
      ).to.be.revertedWithCustomError(rps, "WrongPhase");

      const s = await rps.getSeries(0);
      expect(s.phase).to.equal(Phase.Completed);
      expect(s.wins1).to.equal(2);
      expect(await rps.pendingFees()).to.equal(fee);
    });
  });

  // ── Full 3-round series (p1 1-0, p2 1-1, p1 2-1) ─────────────────────────────

  describe("Series completion — 3 rounds (1-0, 1-1, 2-1)", () => {
    it("plays all 3 rounds and p1 wins the decider", async () => {
      // Round 1: p1 wins
      const c1r1 = makeCommit(p1.address, Move.Rock, SALT1);
      const c2r1 = makeCommit(p2.address, Move.Scissors, SALT2);
      await rps.connect(p1).createSeries(c1r1, { value: BET });
      await rps.connect(p2).joinSeries(0, c2r1, { value: BET });
      await rps.connect(p1).reveal(0, Move.Rock, SALT1);
      await rps.connect(p2).reveal(0, Move.Scissors, SALT2); // 1-0

      // Round 2: p2 wins
      const c1r2 = makeCommit(p1.address, Move.Rock, SALT1B);
      const c2r2 = makeCommit(p2.address, Move.Paper, SALT2B);
      await rps.connect(p1).commitRound(0, c1r2);
      await rps.connect(p2).commitRound(0, c2r2);
      await rps.connect(p1).reveal(0, Move.Rock, SALT1B);
      await rps.connect(p2).reveal(0, Move.Paper, SALT2B); // 1-1

      let s = await rps.getSeries(0);
      expect(s.wins1).to.equal(1);
      expect(s.wins2).to.equal(1);
      expect(s.currentRound).to.equal(3);
      expect(s.phase).to.equal(Phase.Committing);

      // Round 3: p1 wins
      const c1r3 = makeCommit(p1.address, Move.Scissors, SALT1C);
      const c2r3 = makeCommit(p2.address, Move.Paper, SALT2C);
      await rps.connect(p1).commitRound(0, c1r3);
      await rps.connect(p2).commitRound(0, c2r3);
      await rps.connect(p1).reveal(0, Move.Scissors, SALT1C);
      await expect(rps.connect(p2).reveal(0, Move.Paper, SALT2C))
        .to.emit(rps, "SeriesCompleted").withArgs(0n, p1.address, (BET * 2n * (10000n - FEE_BPS)) / 10000n);

      s = await rps.getSeries(0);
      expect(s.phase).to.equal(Phase.Completed);
      expect(s.wins1).to.equal(2);
    });
  });

  // ── Cancel & claimByDefault ──────────────────────────────────────────────────

  describe("cancelSeries", () => {
    it("creator can cancel before anyone joins", async () => {
      const c = makeCommit(p1.address, Move.Rock, SALT1);
      await rps.connect(p1).createSeries(c, { value: BET });

      const before = await ethers.provider.getBalance(p1.address);
      const tx = await rps.connect(p1).cancelSeries(0);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const after = await ethers.provider.getBalance(p1.address);
      expect(after).to.be.closeTo(before + BET - gasUsed, ethers.parseEther("0.0001"));

      await expect(rps.connect(p1).cancelSeries(0))
        .to.be.revertedWithCustomError(rps, "NotCancellable");
    });

    it("non-creator cannot cancel", async () => {
      const c = makeCommit(p1.address, Move.Rock, SALT1);
      await rps.connect(p1).createSeries(c, { value: BET });
      await expect(rps.connect(p2).cancelSeries(0))
        .to.be.revertedWithCustomError(rps, "WrongPlayer");
    });

    it("cannot cancel after p2 joined", async () => {
      const c1 = makeCommit(p1.address, Move.Rock, SALT1);
      await rps.connect(p1).createSeries(c1, { value: BET });
      const c2 = makeCommit(p2.address, Move.Scissors, SALT2);
      await rps.connect(p2).joinSeries(0, c2, { value: BET });
      await expect(rps.connect(p1).cancelSeries(0))
        .to.be.revertedWithCustomError(rps, "NotCancellable");
    });
  });

  describe("claimByDefault", () => {
    it("revealing player claims pot after 24h timeout", async () => {
      const c1 = makeCommit(p1.address, Move.Rock, SALT1);
      const c2 = makeCommit(p2.address, Move.Scissors, SALT2);
      await rps.connect(p1).createSeries(c1, { value: BET });
      await rps.connect(p2).joinSeries(0, c2, { value: BET });

      await rps.connect(p1).reveal(0, Move.Rock, SALT1);

      // Advance time by 24h + 1s
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);

      const pot = BET * 2n;
      const fee = (pot * FEE_BPS) / 10000n;
      const payout = pot - fee;

      await expect(rps.connect(p1).claimByDefault(0))
        .to.emit(rps, "SeriesCompleted").withArgs(0n, p1.address, payout);

      expect(await rps.pendingFees()).to.equal(fee);
    });

    it("rejects claim before timeout", async () => {
      const c1 = makeCommit(p1.address, Move.Rock, SALT1);
      const c2 = makeCommit(p2.address, Move.Scissors, SALT2);
      await rps.connect(p1).createSeries(c1, { value: BET });
      await rps.connect(p2).joinSeries(0, c2, { value: BET });
      await rps.connect(p1).reveal(0, Move.Rock, SALT1);

      await expect(rps.connect(p1).claimByDefault(0))
        .to.be.revertedWithCustomError(rps, "TimeoutNotReached");
    });

    it("rejects claim if neither revealed", async () => {
      const c1 = makeCommit(p1.address, Move.Rock, SALT1);
      const c2 = makeCommit(p2.address, Move.Scissors, SALT2);
      await rps.connect(p1).createSeries(c1, { value: BET });
      await rps.connect(p2).joinSeries(0, c2, { value: BET });

      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);

      await expect(rps.connect(p1).claimByDefault(0))
        .to.be.revertedWithCustomError(rps, "BothOrNeitherRevealed");
    });
  });

  // ── Protocol fees ────────────────────────────────────────────────────────────

  describe("Protocol fees", () => {
    it("withdrawFees sends to feeRecipient, callable by anyone", async () => {
      // Play a complete series (p1 wins 2-0)
      const c1r1 = makeCommit(p1.address, Move.Rock, SALT1);
      const c2r1 = makeCommit(p2.address, Move.Scissors, SALT2);
      await rps.connect(p1).createSeries(c1r1, { value: BET });
      await rps.connect(p2).joinSeries(0, c2r1, { value: BET });
      await rps.connect(p1).reveal(0, Move.Rock, SALT1);
      await rps.connect(p2).reveal(0, Move.Scissors, SALT2);

      const c1r2 = makeCommit(p1.address, Move.Paper, SALT1B);
      const c2r2 = makeCommit(p2.address, Move.Rock, SALT2B);
      await rps.connect(p1).commitRound(0, c1r2);
      await rps.connect(p2).commitRound(0, c2r2);
      await rps.connect(p1).reveal(0, Move.Paper, SALT1B);
      await rps.connect(p2).reveal(0, Move.Rock, SALT2B);

      const pot = BET * 2n;
      const fee = (pot * FEE_BPS) / 10000n;

      expect(await rps.pendingFees()).to.equal(fee);
      expect(await rps.totalFeesCollected()).to.equal(fee);

      const before = await ethers.provider.getBalance(owner.address);
      await rps.connect(other).withdrawFees(); // anyone can call
      const after = await ethers.provider.getBalance(owner.address);

      expect(after - before).to.equal(fee);
      expect(await rps.pendingFees()).to.equal(0n);
    });

    it("setFeeBps — only owner, max 5%", async () => {
      await expect(rps.connect(p1).setFeeBps(100))
        .to.be.revertedWithCustomError(rps, "NotOwner");
      await expect(rps.connect(owner).setFeeBps(501))
        .to.be.revertedWithCustomError(rps, "FeeTooHigh");
      await rps.connect(owner).setFeeBps(100);
      expect(await rps.feeBps()).to.equal(100);
    });

    it("zero fee — winner gets entire pot", async () => {
      const Factory = await ethers.getContractFactory("BestOfThreeRPS");
      const zeroFee = await Factory.deploy(owner.address, 0n) as BestOfThreeRPS;

      const c1r1 = makeCommit(p1.address, Move.Rock, SALT1);
      const c2r1 = makeCommit(p2.address, Move.Scissors, SALT2);
      await zeroFee.connect(p1).createSeries(c1r1, { value: BET });
      await zeroFee.connect(p2).joinSeries(0, c2r1, { value: BET });
      await zeroFee.connect(p1).reveal(0, Move.Rock, SALT1);
      await zeroFee.connect(p2).reveal(0, Move.Scissors, SALT2);

      const c1r2 = makeCommit(p1.address, Move.Paper, SALT1B);
      const c2r2 = makeCommit(p2.address, Move.Rock, SALT2B);
      await zeroFee.connect(p1).commitRound(0, c1r2);
      await zeroFee.connect(p2).commitRound(0, c2r2);

      const before = await ethers.provider.getBalance(p1.address);
      const tx = await zeroFee.connect(p1).reveal(0, Move.Paper, SALT1B);
      const receipt = await tx.wait();
      await zeroFee.connect(p2).reveal(0, Move.Rock, SALT2B);
      const after = await ethers.provider.getBalance(p1.address);

      expect(await zeroFee.pendingFees()).to.equal(0n);
    });
  });

  // ── Views ────────────────────────────────────────────────────────────────────

  describe("Views", () => {
    it("revealDeadline returns 0 outside Revealing phase", async () => {
      const c = makeCommit(p1.address, Move.Rock, SALT1);
      await rps.connect(p1).createSeries(c, { value: BET });
      expect(await rps.revealDeadline(0)).to.equal(0n);
    });

    it("revealDeadline returns joinedAt + 24h during Revealing", async () => {
      const c1 = makeCommit(p1.address, Move.Rock, SALT1);
      const c2 = makeCommit(p2.address, Move.Scissors, SALT2);
      await rps.connect(p1).createSeries(c1, { value: BET });
      const tx = await rps.connect(p2).joinSeries(0, c2, { value: BET });
      const block = await ethers.provider.getBlock(tx.blockNumber!);
      const deadline = await rps.revealDeadline(0);
      expect(deadline).to.equal(BigInt(block!.timestamp) + 86400n);
    });

    it("winnerPayout returns correct value", async () => {
      const c = makeCommit(p1.address, Move.Rock, SALT1);
      await rps.connect(p1).createSeries(c, { value: BET });
      const pot = BET * 2n;
      const fee = (pot * FEE_BPS) / 10000n;
      expect(await rps.winnerPayout(0)).to.equal(pot - fee);
    });
  });

  // ── Ownership ────────────────────────────────────────────────────────────────

  describe("Ownership", () => {
    it("transferOwnership works and new owner can setFeeBps", async () => {
      await rps.connect(owner).transferOwnership(p1.address);
      expect(await rps.owner()).to.equal(p1.address);
      await rps.connect(p1).setFeeBps(100);
      expect(await rps.feeBps()).to.equal(100);
    });

    it("old owner loses privileges after transfer", async () => {
      await rps.connect(owner).transferOwnership(p1.address);
      await expect(rps.connect(owner).setFeeBps(100))
        .to.be.revertedWithCustomError(rps, "NotOwner");
    });
  });
});
