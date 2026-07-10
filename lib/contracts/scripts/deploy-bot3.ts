import { ethers, network, run } from "hardhat";

const FEE_RECIPIENT = "0xFfb6505912FCE95B42be4860477201bb4e204E9f";
const FEE_BPS = 250; // 2.5%

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("Deployer  :", deployer.address);
  console.log("Balance   :", ethers.formatEther(balance), "ETH");
  console.log("Network   :", network.name, `(chainId ${network.config.chainId})`);

  if (balance < ethers.parseEther("0.001")) {
    throw new Error(`Insufficient balance: ${ethers.formatEther(balance)} ETH`);
  }

  const feeRecipient = process.env.FEE_RECIPIENT ?? FEE_RECIPIENT;
  const feeBps = Number(process.env.FEE_BPS ?? FEE_BPS);
  if (Number.isNaN(feeBps) || feeBps < 0 || feeBps > 500) {
    throw new Error(`Invalid FEE_BPS=${feeBps}, must be 0–500`);
  }

  console.log("\nDeploying BestOfThreeRPS…");
  console.log("  feeRecipient:", feeRecipient);
  console.log("  feeBps      :", feeBps, `(${feeBps / 100}%)`);

  const Factory = await ethers.getContractFactory("BestOfThreeRPS");
  const contract = await Factory.deploy(feeRecipient, feeBps);
  await contract.waitForDeployment();
  const addr = await contract.getAddress();

  console.log("\n✅ BestOfThreeRPS deployed at:", addr);
  console.log("   https://basescan.org/address/" + addr);

  // Auto-verify on BaseScan if not localhost
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n⏳ Waiting 10s for BaseScan to index before verifying…");
    await new Promise((r) => setTimeout(r, 10_000));

    try {
      await run("verify:verify", {
        address: addr,
        constructorArguments: [feeRecipient, feeBps],
      });
      console.log("✅ Verified on BaseScan");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("Already Verified")) {
        console.log("✅ Already verified");
      } else {
        console.warn("⚠️  Verification failed:", msg);
        console.log("Retry manually:");
        console.log(`  npx hardhat verify --network ${network.name} ${addr} ${feeRecipient} ${feeBps}`);
      }
    }
  }

  console.log("\n─────────────────────────────────────────────────");
  console.log("Add to replit.md or frontend env if needed:");
  console.log(`  BestOfThreeRPS: ${addr}`);
  console.log("  feeRecipient  :", feeRecipient);
  console.log("  feeBps        :", feeBps);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
