import { ethers } from "hardhat";
import { ContractFactory } from "ethers";

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

  await deployContract(
    config.harvester.contractName,
    HarvesterFactory,
    harvesterConstructorArguments
  );
};

const deployContract = async (
  name: string,
  contractFactory: ContractFactory,
  constructorArgs: any[]
): Promise<{ contract: string; impl: string }> => {
  console.log("Deploying:", name);
  const ret = {
    contract: "",
    impl: "",
  };
  const deployTx = await contractFactory.deploy(...constructorArgs);
  await deployTx.deployed();
  console.log(`${name}: ${deployTx.address}`);
  const contract = await ethers.getContractAt(name, deployTx.address);
  ret.contract = contract.address;

  return ret;
};

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
