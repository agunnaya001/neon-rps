import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const feeRecipient =
    process.env.FEE_RECIPIENT ?? deployer.address;
  const feeBpsEnv = process.env.FEE_BPS ?? "250"; // 2.5% default
  const feeBps = Number(feeBpsEnv);
  if (Number.isNaN(feeBps) || feeBps < 0 || feeBps > 500) {
    throw new Error(`Invalid FEE_BPS=${feeBpsEnv}, must be 0-500`);
  }

  console.log(`Deploying CommitRevealRPS as ${deployer.address}`);
  console.log(`  feeRecipient: ${feeRecipient}`);
  console.log(`  feeBps:       ${feeBps} (${feeBps / 100}%)`);

  const Factory = await ethers.getContractFactory("CommitRevealRPS");
  const c = await Factory.deploy(feeRecipient, feeBps);
  await c.waitForDeployment();
  const addr = await c.getAddress();
  console.log(`\nCommitRevealRPS deployed to ${addr} on network ${network.name}`);
  console.log(`\nAdd this to artifacts/rps-game/.env:`);
  console.log(`VITE_CONTRACT_ADDRESS=${addr}`);
  console.log(`VITE_CHAIN_ID=${network.config.chainId ?? 31337}`);
  console.log(
    `\nVerify with:\n  npx hardhat verify --network ${network.name} ${addr} ${feeRecipient} ${feeBps}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
