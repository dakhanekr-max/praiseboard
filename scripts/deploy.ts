import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const PraiseBoard = await ethers.getContractFactory("PraiseBoard");
  const praiseBoard = await PraiseBoard.deploy();
  await praiseBoard.waitForDeployment();
  const address = await praiseBoard.getAddress();

  console.log("PraiseBoard deployed to:", address);

  const network = await ethers.provider.getNetwork();
  console.log("Network Chain ID:", network.chainId);
  
  const txHash = praiseBoard.deploymentTransaction()?.hash;
  console.log("Deployment Transaction Hash:", txHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
