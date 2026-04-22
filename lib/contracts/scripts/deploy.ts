import { ethers, network } from "hardhat";

async function main() {
  const Factory = await ethers.getContractFactory("CommitRevealRPS");
  const c = await Factory.deploy();
  await c.waitForDeployment();
  const addr = await c.getAddress();
  console.log(`CommitRevealRPS deployed to ${addr} on network ${network.name}`);
  console.log(`\nAdd this to artifacts/rps-game/.env:`);
  console.log(`VITE_CONTRACT_ADDRESS=${addr}`);
  console.log(`VITE_CHAIN_ID=${network.config.chainId ?? 31337}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
