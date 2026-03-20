const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("========================================");
  console.log("  VerifyChain — Deploying to Arbitrum");
  console.log("========================================");
  console.log("Deployer address:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const SupplierRegistry = await ethers.getContractFactory("SupplierRegistry");
  console.log("\nDeploying SupplierRegistry...");

  const registry = await SupplierRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("\n✅ SupplierRegistry deployed to:", address);
  console.log("\n📋 Add this to your .env files:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log(`CONTRACT_ADDRESS=${address}`);

  // Verify on Arbiscan (run after deployment)
  console.log("\n📡 To verify on Arbiscan run:");
  console.log(`npx hardhat verify --network arbitrumSepolia ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
