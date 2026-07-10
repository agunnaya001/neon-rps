import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🚀 Deploying BestOfThreeRPS v2 to Base Mainnet...');

  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying from account: ${deployer.address}`);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);

  // Verify sufficient balance for deployment
  if (balance < ethers.parseEther('0.05')) {
    throw new Error('❌ Insufficient balance for deployment (need 0.05 ETH minimum)');
  }

  // Deploy contract
  console.log('\n⏳ Deploying BestOfThreeRPS v2...');
  const BestOfThreeRPS = await ethers.getContractFactory('BestOfThreeRPS', deployer);
  
  const contract = await BestOfThreeRPS.deploy();
  await contract.deploymentTransaction()?.wait(1);

  const deployedAddress = await contract.getAddress();
  console.log(`✅ BestOfThreeRPS v2 deployed to: ${deployedAddress}`);

  // Wait for confirmations
  console.log('\n⏳ Waiting for 5 block confirmations...');
  await contract.deploymentTransaction()?.wait(5);
  console.log('✅ Confirmed!');

  // Save deployment info
  const deploymentInfo = {
    contract: 'BestOfThreeRPS_v2',
    address: deployedAddress,
    deployer: deployer.address,
    network: 'Base Mainnet',
    chainId: 8453,
    timestamp: new Date().toISOString(),
    transactionHash: contract.deploymentTransaction()?.hash,
  };

  const outputPath = path.join(__dirname, '../deployments/BestOfThreeRPS_v2.json');
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📄 Deployment info saved to: ${outputPath}`);

  // Display summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 DEPLOYMENT SUCCESSFUL');
  console.log('='.repeat(60));
  console.log(`Contract:  BestOfThreeRPS v2`);
  console.log(`Address:   ${deployedAddress}`);
  console.log(`Network:   Base Mainnet (8453)`);
  console.log(`Deployer:  ${deployer.address}`);
  console.log('='.repeat(60));

  // Next steps
  console.log('\n📋 Next Steps:');
  console.log(`1. Verify on BaseScan:`);
  console.log(`   npx hardhat verify --network base ${deployedAddress}`);
  console.log(`\n2. Update frontend contract address:`);
  console.log(`   artifacts/rps-game/src/lib/contract.ts`);
  console.log(`\n3. Deploy backend and frontend to Vercel`);
  console.log(`\n4. Update leaderboard to track new contract`);

  return deployedAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
