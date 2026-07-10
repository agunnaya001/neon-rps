import { expect } from "chai";
import { ethers } from "hardhat";
import type { CommitRevealRPS } from "../typechain-types";

const Move = { None: 0, Rock: 1, Paper: 2, Scissors: 3 } as const;
const Phase = {
  Empty: 0,
  WaitingForOpponent: 1,
  WaitingForReveals: 2,
  Resolved: 3,
  Refunded: 4,
  Cancelled: 5,
} as const;

const REVEAL_TIMEOUT = 24 * 60 * 60;
const DEFAULT_FEE_BPS = 250; // 2.5%

function randomSalt(): string {
  return ethers.hexlify(ethers.randomBytes(32));
}

function commit(player: string, move: number, salt: string): string {
  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "uint8", "bytes32"],
      [player, move, salt],
    ),
  );
}

function feeOf(pot: bigint, bps: number = DEFAULT_FEE_BPS): bigint {
  return (pot * BigInt(bps)) / 10_000n;
}

async function deploy(
  feeBps: number = DEFAULT_FEE_BPS,
  feeRecipientAddr?: string,
): Promise<CommitRevealRPS> {
  const [deployer, , , feeRecipient] = await ethers.getSigners();
  const recipient = feeRecipientAddr ?? feeRecipient.address;
  const F = await ethers.getContractFactory("CommitRevealRPS");
  const c = await F.connect(deployer).deploy(recipient, feeBps);
  await c.waitForDeployment();
  return c as unknown as CommitRevealRPS;
}

describe("CommitRevealRPS", () => {
  it("creates an open game with a bet", async () => {
    const [p1] = await ethers.getSigners();
    const c = await deploy();
    const salt = randomSalt();
    const h = commit(p1.address, Move.Rock, salt);
    const bet = ethers.parseEther("0.1");

    await expect(c.connect(p1).createGame(h, { value: bet }))
      .to.emit(c, "GameCreated")
      .withArgs(0n, p1.address, bet);

    const g = await c.getGame(0);
    expect(g.player1).to.equal(p1.address);
    expect(g.bet).to.equal(bet);
    expect(g.phase).to.equal(Phase.WaitingForOpponent);

    const open = await c.getOpenGames();
    expect(open.map((x) => Number(x))).to.deep.equal([0]);
  });

  it("rejects empty commitment and zero gameId for missing games", async () => {
    const [p1] = await ethers.getSigners();
    const c = await deploy();
    await expect(
      c.connect(p1).createGame(ethers.ZeroHash, { value: 0 }),
    ).to.be.revertedWith("Empty commitment");

    await expect(c.joinGame(99, ethers.ZeroHash)).to.be.reverted;
  });

  it("lets a second player join with matching bet", async () => {
    const [p1, p2] = await ethers.getSigners();
    const c = await deploy();
    const salt1 = randomSalt();
    const salt2 = randomSalt();
    const bet = ethers.parseEther("0.5");

    await c.connect(p1).createGame(commit(p1.address, Move.Rock, salt1), { value: bet });
    await expect(
      c.connect(p2).joinGame(0, commit(p2.address, Move.Scissors, salt2), { value: bet }),
    ).to.emit(c, "GameJoined");

    const g = await c.getGame(0);
    expect(g.phase).to.equal(Phase.WaitingForReveals);
    expect(await c.openGamesCount()).to.equal(0n);
  });

  it("rejects joining own game, mismatched bet, and joining twice", async () => {
    const [p1, p2, p3] = await ethers.getSigners();
    const c = await deploy();
    const bet = ethers.parseEther("0.1");
    await c.connect(p1).createGame(commit(p1.address, Move.Rock, randomSalt()), { value: bet });

    await expect(
      c.connect(p1).joinGame(0, commit(p1.address, Move.Paper, randomSalt()), { value: bet }),
    ).to.be.revertedWithCustomError(c, "CannotJoinOwnGame");

    await expect(
      c.connect(p2).joinGame(0, commit(p2.address, Move.Paper, randomSalt()), { value: bet * 2n }),
    ).to.be.revertedWithCustomError(c, "WrongBet");

    await c.connect(p2).joinGame(0, commit(p2.address, Move.Paper, randomSalt()), { value: bet });
    await expect(
      c.connect(p3).joinGame(0, commit(p3.address, Move.Paper, randomSalt()), { value: bet }),
    ).to.be.revertedWithCustomError(c, "WrongPhase");
  });

  it("rejects reveals before both players committed", async () => {
    const [p1] = await ethers.getSigners();
    const c = await deploy();
    const salt = randomSalt();
    await c.connect(p1).createGame(commit(p1.address, Move.Rock, salt), { value: 0 });
    await expect(c.connect(p1).reveal(0, Move.Rock, salt)).to.be.revertedWithCustomError(
      c,
      "WrongPhase",
    );
  });

  async function playFullGame(bet: bigint, move1: number, move2: number, feeBps?: number) {
    const [p1, p2] = await ethers.getSigners();
    const c = await deploy(feeBps);
    const salt1 = randomSalt();
    const salt2 = randomSalt();
    await c.connect(p1).createGame(commit(p1.address, move1, salt1), { value: bet });
    await c.connect(p2).joinGame(0, commit(p2.address, move2, salt2), { value: bet });
    return { c, p1, p2, salt1, salt2 };
  }

  it("pays the winner the pot minus protocol fee (Rock beats Scissors)", async () => {
    const bet = ethers.parseEther("1");
    const pot = bet * 2n;
    const fee = feeOf(pot);
    const payout = pot - fee;
    const { c, p1, p2, salt1, salt2 } = await playFullGame(bet, Move.Rock, Move.Scissors);

    await c.connect(p1).reveal(0, Move.Rock, salt1);
    const before = await ethers.provider.getBalance(p1.address);

    const tx = await c.connect(p2).reveal(0, Move.Scissors, salt2);
    await expect(tx).to.emit(c, "GameResolved").withArgs(0n, p1.address, payout, fee);
    await expect(tx).to.emit(c, "FeeCollected").withArgs(0n, fee);

    const after = await ethers.provider.getBalance(p1.address);
    expect(after - before).to.equal(payout);
    expect(await c.totalFeesCollected()).to.equal(fee);
    expect(await c.pendingFees()).to.equal(fee);

    const g = await c.getGame(0);
    expect(g.phase).to.equal(Phase.Resolved);
    expect(g.winner).to.equal(p1.address);
  });

  it("Paper beats Rock and Scissors beats Paper", async () => {
    {
      const bet = ethers.parseEther("0.2");
      const fee = feeOf(bet * 2n);
      const payout = bet * 2n - fee;
      const { c, p1, p2, salt1, salt2 } = await playFullGame(bet, Move.Rock, Move.Paper);
      await c.connect(p1).reveal(0, Move.Rock, salt1);
      await expect(c.connect(p2).reveal(0, Move.Paper, salt2))
        .to.emit(c, "GameResolved")
        .withArgs(0n, p2.address, payout, fee);
    }
    {
      const bet = ethers.parseEther("0.2");
      const fee = feeOf(bet * 2n);
      const payout = bet * 2n - fee;
      const { c, p1, p2, salt1, salt2 } = await playFullGame(bet, Move.Paper, Move.Scissors);
      await c.connect(p1).reveal(0, Move.Paper, salt1);
      await expect(c.connect(p2).reveal(0, Move.Scissors, salt2))
        .to.emit(c, "GameResolved")
        .withArgs(0n, p2.address, payout, fee);
    }
  });

  it("does NOT take a fee on a tie — both players are fully refunded", async () => {
    const bet = ethers.parseEther("0.3");
    const { c, p1, p2, salt1, salt2 } = await playFullGame(bet, Move.Paper, Move.Paper);

    await c.connect(p1).reveal(0, Move.Paper, salt1);

    const before1 = await ethers.provider.getBalance(p1.address);
    const tx = await c.connect(p2).reveal(0, Move.Paper, salt2);
    await expect(tx).to.emit(c, "GameTied").withArgs(0n, bet);

    const after1 = await ethers.provider.getBalance(p1.address);
    expect(after1 - before1).to.equal(bet);
    expect(await c.totalFeesCollected()).to.equal(0n);

    const g = await c.getGame(0);
    expect(g.phase).to.equal(Phase.Refunded);
  });

  it("does NOT take a fee on cancellation", async () => {
    const [p1] = await ethers.getSigners();
    const c = await deploy();
    const bet = ethers.parseEther("0.4");
    await c.connect(p1).createGame(commit(p1.address, Move.Rock, randomSalt()), { value: bet });
    await c.connect(p1).cancelGame(0);
    expect(await c.totalFeesCollected()).to.equal(0n);
  });

  it("rejects reveal with wrong salt or wrong move (commitment mismatch)", async () => {
    const bet = 0n;
    const { c, p1, salt1 } = await playFullGame(bet, Move.Rock, Move.Paper);

    await expect(c.connect(p1).reveal(0, Move.Paper, salt1)).to.be.revertedWithCustomError(
      c,
      "CommitmentMismatch",
    );
    await expect(
      c.connect(p1).reveal(0, Move.Rock, randomSalt()),
    ).to.be.revertedWithCustomError(c, "CommitmentMismatch");
  });

  it("rejects reveal from non-players and double-reveal", async () => {
    const bet = 0n;
    const { c, p1, salt1 } = await playFullGame(bet, Move.Rock, Move.Scissors);
    const [, , p3] = await ethers.getSigners();

    await expect(c.connect(p3).reveal(0, Move.Rock, salt1)).to.be.revertedWithCustomError(
      c,
      "NotAPlayer",
    );

    await c.connect(p1).reveal(0, Move.Rock, salt1);
    await expect(c.connect(p1).reveal(0, Move.Rock, salt1)).to.be.revertedWithCustomError(
      c,
      "AlreadyRevealed",
    );
  });

  it("rejects invalid move enum value (Move.None)", async () => {
    const [p1, p2] = await ethers.getSigners();
    const c = await deploy();
    const salt = randomSalt();
    await c.connect(p1).createGame(commit(p1.address, Move.Rock, salt), { value: 0 });
    await c.connect(p2).joinGame(0, commit(p2.address, Move.Rock, salt), { value: 0 });
    await expect(c.connect(p1).reveal(0, Move.None, salt)).to.be.revertedWithCustomError(
      c,
      "InvalidMove",
    );
  });

  it("removes joined games from open list and tracks multiple opens", async () => {
    const [p1, p2] = await ethers.getSigners();
    const c = await deploy();
    const s = randomSalt();
    await c.connect(p1).createGame(commit(p1.address, Move.Rock, s), { value: 0 });
    await c.connect(p1).createGame(commit(p1.address, Move.Paper, s), { value: 0 });
    await c.connect(p1).createGame(commit(p1.address, Move.Scissors, s), { value: 0 });

    expect((await c.getOpenGames()).map((x) => Number(x))).to.deep.equal([0, 1, 2]);

    await c.connect(p2).joinGame(1, commit(p2.address, Move.Rock, s), { value: 0 });
    const open = (await c.getOpenGames()).map((x) => Number(x)).sort();
    expect(open).to.deep.equal([0, 2]);
  });

  it("computeCommitment matches the off-chain hash", async () => {
    const [p1] = await ethers.getSigners();
    const c = await deploy();
    const salt = randomSalt();
    const onChain = await c.computeCommitment(p1.address, Move.Rock, salt);
    expect(onChain).to.equal(commit(p1.address, Move.Rock, salt));
  });

  describe("cancelGame", () => {
    it("lets player1 cancel an unjoined game and refunds their bet", async () => {
      const [p1] = await ethers.getSigners();
      const c = await deploy();
      const bet = ethers.parseEther("0.4");
      await c.connect(p1).createGame(commit(p1.address, Move.Rock, randomSalt()), { value: bet });

      const before = await ethers.provider.getBalance(p1.address);
      const tx = await c.connect(p1).cancelGame(0);
      const receipt = await tx.wait();
      const gas = receipt!.gasUsed * receipt!.gasPrice;

      await expect(tx).to.emit(c, "GameCancelled").withArgs(0n, p1.address, bet);
      const after = await ethers.provider.getBalance(p1.address);
      expect(after - before + gas).to.equal(bet);

      const g = await c.getGame(0);
      expect(g.phase).to.equal(Phase.Cancelled);
      expect(await c.openGamesCount()).to.equal(0n);
    });

    it("rejects cancel from non-creator and after someone joined", async () => {
      const [p1, p2] = await ethers.getSigners();
      const c = await deploy();
      await c.connect(p1).createGame(commit(p1.address, Move.Rock, randomSalt()), { value: 0 });

      await expect(c.connect(p2).cancelGame(0)).to.be.revertedWithCustomError(c, "NotPlayer1");

      await c.connect(p2).joinGame(0, commit(p2.address, Move.Paper, randomSalt()), { value: 0 });
      await expect(c.connect(p1).cancelGame(0)).to.be.revertedWithCustomError(c, "WrongPhase");
    });
  });

  describe("claimByDefault", () => {
    it("lets the revealer claim the pot minus fee after the deadline", async () => {
      const [p1, p2] = await ethers.getSigners();
      const c = await deploy();
      const bet = ethers.parseEther("0.5");
      const pot = bet * 2n;
      const fee = feeOf(pot);
      const payout = pot - fee;

      const salt1 = randomSalt();
      await c.connect(p1).createGame(commit(p1.address, Move.Rock, salt1), { value: bet });
      await c.connect(p2).joinGame(0, commit(p2.address, Move.Paper, randomSalt()), { value: bet });

      await c.connect(p1).reveal(0, Move.Rock, salt1);

      await expect(c.connect(p1).claimByDefault(0)).to.be.revertedWithCustomError(
        c,
        "DeadlineNotPassed",
      );

      await ethers.provider.send("evm_increaseTime", [REVEAL_TIMEOUT + 1]);
      await ethers.provider.send("evm_mine", []);

      const before = await ethers.provider.getBalance(p1.address);
      const tx = await c.connect(p1).claimByDefault(0);
      const receipt = await tx.wait();
      const gas = receipt!.gasUsed * receipt!.gasPrice;

      await expect(tx).to.emit(c, "GameClaimedByDefault").withArgs(0n, p1.address, payout, fee);
      const after = await ethers.provider.getBalance(p1.address);
      expect(after - before + gas).to.equal(payout);
      expect(await c.totalFeesCollected()).to.equal(fee);
    });

    it("rejects claim if the caller hasn't revealed", async () => {
      const [p1, p2] = await ethers.getSigners();
      const c = await deploy();
      const salt1 = randomSalt();
      await c.connect(p1).createGame(commit(p1.address, Move.Rock, salt1), { value: 0 });
      await c.connect(p2).joinGame(0, commit(p2.address, Move.Paper, randomSalt()), { value: 0 });

      await ethers.provider.send("evm_increaseTime", [REVEAL_TIMEOUT + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(c.connect(p1).claimByDefault(0)).to.be.revertedWithCustomError(
        c,
        "AlreadyRevealedYourMove",
      );
    });

    it("rejects claim if both players have revealed", async () => {
      const [p1, p2] = await ethers.getSigners();
      const c = await deploy();
      const salt1 = randomSalt();
      const salt2 = randomSalt();
      await c.connect(p1).createGame(commit(p1.address, Move.Rock, salt1), { value: 0 });
      await c.connect(p2).joinGame(0, commit(p2.address, Move.Paper, salt2), { value: 0 });
      await c.connect(p1).reveal(0, Move.Rock, salt1);
      await c.connect(p2).reveal(0, Move.Paper, salt2);

      await expect(c.connect(p1).claimByDefault(0)).to.be.revertedWithCustomError(
        c,
        "WrongPhase",
      );
    });
  });

  it("revealDeadline view returns 0 outside reveal phase and timestamp inside", async () => {
    const [p1, p2] = await ethers.getSigners();
    const c = await deploy();
    await c.connect(p1).createGame(commit(p1.address, Move.Rock, randomSalt()), { value: 0 });
    expect(await c.revealDeadline(0)).to.equal(0n);

    await c.connect(p2).joinGame(0, commit(p2.address, Move.Paper, randomSalt()), { value: 0 });
    const dl = await c.revealDeadline(0);
    expect(dl).to.be.greaterThan(0n);
  });

  describe("protocol fee / treasury", () => {
    it("constructor rejects fee above MAX_FEE_BPS or zero address recipient", async () => {
      const F = await ethers.getContractFactory("CommitRevealRPS");
      const [, , , recipient] = await ethers.getSigners();
      await expect(F.deploy(recipient.address, 501)).to.be.revertedWithCustomError(
        await F.deploy(recipient.address, 0),
        "FeeTooHigh",
      );
      await expect(F.deploy(ethers.ZeroAddress, 250)).to.be.revertedWithCustomError(
        await F.deploy(recipient.address, 0),
        "ZeroAddress",
      );
    });

    it("zero fee → winner gets the entire pot", async () => {
      const bet = ethers.parseEther("0.1");
      const { c, p1, p2, salt1, salt2 } = await playFullGame(bet, Move.Rock, Move.Scissors, 0);
      await c.connect(p1).reveal(0, Move.Rock, salt1);
      const before = await ethers.provider.getBalance(p1.address);
      await c.connect(p2).reveal(0, Move.Scissors, salt2);
      const after = await ethers.provider.getBalance(p1.address);
      expect(after - before).to.equal(bet * 2n);
      expect(await c.totalFeesCollected()).to.equal(0n);
    });

    it("setFeeBps updates the fee and only the owner can call it", async () => {
      const [owner, , , , attacker] = await ethers.getSigners();
      const c = await deploy();
      await expect(c.connect(attacker).setFeeBps(100)).to.be.revertedWithCustomError(
        c,
        "NotOwner",
      );
      await expect(c.connect(owner).setFeeBps(501)).to.be.revertedWithCustomError(
        c,
        "FeeTooHigh",
      );
      await expect(c.connect(owner).setFeeBps(100))
        .to.emit(c, "FeeBpsUpdated")
        .withArgs(DEFAULT_FEE_BPS, 100);
      expect(await c.feeBps()).to.equal(100n);
    });

    it("withdrawFees sends all pending fees to the recipient (callable by anyone)", async () => {
      const [, , , recipient, randoCaller] = await ethers.getSigners();
      const bet = ethers.parseEther("1");
      const { c, p1, p2, salt1, salt2 } = await playFullGame(bet, Move.Rock, Move.Scissors);
      await c.connect(p1).reveal(0, Move.Rock, salt1);
      await c.connect(p2).reveal(0, Move.Scissors, salt2);

      const fee = feeOf(bet * 2n);
      expect(await c.pendingFees()).to.equal(fee);

      const before = await ethers.provider.getBalance(recipient.address);
      const tx = await c.connect(randoCaller).withdrawFees();
      await expect(tx).to.emit(c, "FeesWithdrawn").withArgs(recipient.address, fee);
      const after = await ethers.provider.getBalance(recipient.address);
      expect(after - before).to.equal(fee);

      expect(await c.pendingFees()).to.equal(0n);
      expect(await c.totalFeesWithdrawn()).to.equal(fee);

      await expect(c.connect(randoCaller).withdrawFees()).to.be.revertedWithCustomError(
        c,
        "NothingToWithdraw",
      );
    });

    it("transferOwnership moves admin rights", async () => {
      const [owner, , , , newOwner] = await ethers.getSigners();
      const c = await deploy();
      await expect(c.connect(newOwner).transferOwnership(newOwner.address))
        .to.be.revertedWithCustomError(c, "NotOwner");
      await c.connect(owner).transferOwnership(newOwner.address);
      expect(await c.owner()).to.equal(newOwner.address);
      await expect(c.connect(owner).setFeeBps(0)).to.be.revertedWithCustomError(c, "NotOwner");
      await c.connect(newOwner).setFeeBps(0);
    });

    it("winnerPayout view matches actual payout", async () => {
      const bet = ethers.parseEther("0.7");
      const { c } = await playFullGame(bet, Move.Rock, Move.Paper);
      const [payout, fee] = await c.winnerPayout(0);
      expect(payout).to.equal(bet * 2n - feeOf(bet * 2n));
      expect(fee).to.equal(feeOf(bet * 2n));
    });
  });
});
