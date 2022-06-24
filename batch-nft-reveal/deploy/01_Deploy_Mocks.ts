import { ethers } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const BASE_FEE = ethers.utils.parseEther("0.25");
const GAS_PRICE_LINK = ethers.utils.parseEther("0.000000001");

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  getChainId,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  if (developmentChains.includes(chainId)) {
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: [BASE_FEE, GAS_PRICE_LINK],
    });
  }
};

func.tags = ["all", "mocks"];

export default func;
