import { ethers } from "hardhat";
import { networkConfig, developmentChains } from "../helper-hardhat-config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { VRFCoordinatorV2Interface } from "../typechain";

const NFT_NAME = process.env.NFT_NAME;
const NFT_SYMBOL = process.env.NFT_SYMBOL;
const NFT_MAX_SUPPLY = process.env.NFT_MAX_SUPPLY;
const NFT_MINT_COST = ethers.utils.parseEther(process.env.NFT_MINT_COST || "");
const NFT_REVEAL_BATCH_SIZE = process.env.NFT_REVEAL_BATCH_SIZE;
const NFT_REVEAL_INTERVAL = process.env.NFT_REVEAL_INTERVAL;

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  getChainId,
}: HardhatRuntimeEnvironment) {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  let vrfCoordinatorV2Address: string;
  let vrfSubscriptionId: string;

  if (developmentChains.includes(chainId)) {
    const VRFCoordinatorV2Mock = await get("VRFCoordinatorV2Mock");
    vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address;
    const vrfCoordinatorV2Mock = (await ethers.getContractAt(
      "VRFCoordinatorV2Mock",
      vrfCoordinatorV2Address
    )) as unknown as VRFCoordinatorV2Interface;

    const createSubscriptionTx =
      await vrfCoordinatorV2Mock.createSubscription();
    const createSubscriptionReceipt = await createSubscriptionTx.wait();
    vrfSubscriptionId =
      createSubscriptionReceipt.events &&
      createSubscriptionReceipt.events[0].args?.subId;
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2 as string;
    vrfSubscriptionId = networkConfig[chainId].subscriptionId as string;
  }
  const { gasLane: vrfGasLane, callbackGasLimit: vrfCallbackGasLimit } =
    networkConfig[chainId];

  await deploy("NFTCollection", {
    from: deployer,
    args: [
      NFT_NAME,
      NFT_SYMBOL,
      NFT_MAX_SUPPLY,
      NFT_MINT_COST,
      NFT_REVEAL_BATCH_SIZE,
      NFT_REVEAL_INTERVAL,
      vrfCoordinatorV2Address,
      vrfSubscriptionId,
      vrfGasLane,
      vrfCallbackGasLimit,
    ],
    log: true,
  });
};

func.tags = ["all", "main"];

export default func;
