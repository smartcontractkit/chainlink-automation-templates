import { ethers, run } from "hardhat";
import { networkConfig, developmentChains } from "../helper-hardhat-config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { VRFCoordinatorV2Mock } from "../typechain";

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
  const isDevChain = developmentChains.includes(chainId);

  let vrfCoordinatorV2Address: string;
  let vrfSubscriptionId: string;

  if (isDevChain) {
    const VRFCoordinatorV2Mock = await get("VRFCoordinatorV2Mock");
    vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address;
    const vrfCoordinatorV2Mock = (await ethers.getContractAt(
      "VRFCoordinatorV2Mock",
      vrfCoordinatorV2Address
    )) as unknown as VRFCoordinatorV2Mock;

    const createSubscriptionTx =
      await vrfCoordinatorV2Mock.createSubscription();
    const createSubscriptionReceipt = await createSubscriptionTx.wait();
    vrfSubscriptionId =
      createSubscriptionReceipt.events &&
      createSubscriptionReceipt.events[0].args?.subId;

    const fundAmount = networkConfig[chainId].fundAmount as string;
    await vrfCoordinatorV2Mock.fundSubscription(vrfSubscriptionId, fundAmount);
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2 as string;
    vrfSubscriptionId = networkConfig[chainId].subscriptionId as string;
  }
  const { gasLane: vrfGasLane, callbackGasLimit: vrfCallbackGasLimit } =
    networkConfig[chainId];

  const args = [
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
  ];

  const result = await deploy("NFTCollection", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: isDevChain ? undefined : 6,
  });

  if (!isDevChain) {
    console.log("Verifying NFTCollection...");
    await run("verify:verify", {
      address: result.address,
      contract: "contracts/NFTCollection.sol:NFTCollection",
      constructorArguments: args,
    });
  }
};

func.tags = ["all", "main"];

export default func;
