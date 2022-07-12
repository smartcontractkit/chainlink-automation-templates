import { ethers, network, run } from "hardhat";
import { Contract, ContractFactory } from "ethers";

// Sample address of KeeperRegistry contract deployed on Polygon
// Change to the KeeperRegistry contract for your target network
const keeperRegistry = "0x7b3EC232b08BD7b4b3305BE0C044D907B2DF960B";

const config = {
  harvester: {
    // Test deployment of MockHarvester
    // Change to your KeeperCompatibleHarvester based contract name
    contractName: "MockHarvester",
    args: {
      keeperRegistry,
      performUpkeepGasLimit: 2500000,
      performUpkeepGasLimitBuffer: 100000,
      vaultHarvestFunctionGasOverhead: 600000,
      keeperRegistryGasOverhead: 80000,
    },
  },
};

const deploy = async () => {
  await deployHarvester();
  console.log("Deployment is successful");
};

const deployHarvester = async () => {
  const HarvesterFactory = await ethers.getContractFactory(
    config.harvester.contractName
  );

  const {
    keeperRegistry,
    performUpkeepGasLimit,
    performUpkeepGasLimitBuffer,
    vaultHarvestFunctionGasOverhead,
    keeperRegistryGasOverhead,
  } = config.harvester.args;

  const harvesterConstructorArguments: any[] = [
    keeperRegistry,
    performUpkeepGasLimit,
    performUpkeepGasLimitBuffer,
    vaultHarvestFunctionGasOverhead,
    keeperRegistryGasOverhead,
  ];

  const contract = await deployContract(
    config.harvester.contractName,
    HarvesterFactory,
    harvesterConstructorArguments
  );

  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting to verify...");
    await contract.deployTransaction.wait(6);
    console.log(`Verifying ${config.harvester.contractName}...`);
    await run("verify:verify", {
      address: contract.address,
      contract: `contracts/test/${config.harvester.contractName}.sol:${config.harvester.contractName}`,
      constructorArguments: harvesterConstructorArguments,
    });
  }
};

const deployContract = async (
  name: string,
  contractFactory: ContractFactory,
  constructorArgs: any[]
): Promise<Contract> => {
  console.log("Deploying:", name);

  const deployTx = await contractFactory.deploy(...constructorArgs);
  await deployTx.deployed();
  console.log(`${name}: ${deployTx.address}`);

  return deployTx;
};

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
