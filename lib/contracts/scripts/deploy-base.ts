import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const feeRecipient = process.env.FEE_RECIPIENT ?? deployer.address;
  const feeBps = Number(process.env.FEE_BPS ?? "250");

  console.log(`\nDeploying CommitRevealRPS v3 to Base mainnet...`);
  console.log(`  feeRecipient: ${feeRecipient}`);
  console.log(`  feeBps: ${feeBps} (${feeBps / 100}%)`);

  const Factory = await ethers.getContractFactory("CommitRevealRPS");
  const contract = await Factory.deploy(feeRecipient, feeBps);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`\n✅ Deployed at: ${address}`);
  console.log(`   https://basescan.org/address/${address}`);
  console.log(`\nVerify with:`);
  console.log(`  npx hardhat verify --network base ${address} ${feeRecipient} ${feeBps}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
