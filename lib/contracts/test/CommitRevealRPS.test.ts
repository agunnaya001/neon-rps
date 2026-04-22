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
} as const;

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

async function deploy(): Promise<CommitRevealRPS> {
  const F = await ethers.getContractFactory("CommitRevealRPS");
  const c = await F.deploy();
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
    )
      .to.emit(c, "GameJoined")
      .withArgs(0n, p2.address);

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

  async function playFullGame(
    bet: bigint,
    move1: number,
    move2: number,
  ) {
    const [p1, p2] = await ethers.getSigners();
    const c = await deploy();
    const salt1 = randomSalt();
    const salt2 = randomSalt();
    await c.connect(p1).createGame(commit(p1.address, move1, salt1), { value: bet });
    await c.connect(p2).joinGame(0, commit(p2.address, move2, salt2), { value: bet });
    return { c, p1, p2, salt1, salt2 };
  }

  it("pays the winner the full pot (Rock beats Scissors)", async () => {
    const bet = ethers.parseEther("1");
    const { c, p1, p2, salt1, salt2 } = await playFullGame(bet, Move.Rock, Move.Scissors);

    await c.connect(p1).reveal(0, Move.Rock, salt1);
    const before = await ethers.provider.getBalance(p1.address);

    const tx = await c.connect(p2).reveal(0, Move.Scissors, salt2);
    await expect(tx).to.emit(c, "GameResolved").withArgs(0n, p1.address, bet * 2n);

    const after = await ethers.provider.getBalance(p1.address);
    expect(after - before).to.equal(bet * 2n);

    const g = await c.getGame(0);
    expect(g.phase).to.equal(Phase.Resolved);
    expect(g.winner).to.equal(p1.address);
  });

  it("Paper beats Rock and Scissors beats Paper", async () => {
    {
      const bet = ethers.parseEther("0.2");
      const { c, p1, p2, salt1, salt2 } = await playFullGame(bet, Move.Rock, Move.Paper);
      await c.connect(p1).reveal(0, Move.Rock, salt1);
      await expect(c.connect(p2).reveal(0, Move.Paper, salt2))
        .to.emit(c, "GameResolved")
        .withArgs(0n, p2.address, bet * 2n);
    }
    {
      const bet = ethers.parseEther("0.2");
      const { c, p1, p2, salt1, salt2 } = await playFullGame(bet, Move.Paper, Move.Scissors);
      await c.connect(p1).reveal(0, Move.Paper, salt1);
      await expect(c.connect(p2).reveal(0, Move.Scissors, salt2))
        .to.emit(c, "GameResolved")
        .withArgs(0n, p2.address, bet * 2n);
    }
  });

  it("refunds both players on a tie", async () => {
    const bet = ethers.parseEther("0.3");
    const { c, p1, p2, salt1, salt2 } = await playFullGame(bet, Move.Paper, Move.Paper);

    await c.connect(p1).reveal(0, Move.Paper, salt1);

    const before1 = await ethers.provider.getBalance(p1.address);
    const tx = await c.connect(p2).reveal(0, Move.Paper, salt2);
    await expect(tx).to.emit(c, "GameTied").withArgs(0n, bet);

    const after1 = await ethers.provider.getBalance(p1.address);
    expect(after1 - before1).to.equal(bet);

    const g = await c.getGame(0);
    expect(g.phase).to.equal(Phase.Refunded);
    expect(g.winner).to.equal(ethers.ZeroAddress);
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
    const [p1] = await ethers.getSigners();
    const c = await deploy();
    const salt = randomSalt();
    await c.connect(p1).createGame(commit(p1.address, Move.Rock, salt), { value: 0 });
    const [, p2] = await ethers.getSigners();
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
});
