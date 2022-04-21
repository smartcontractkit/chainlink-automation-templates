import { ethers } from "hardhat";
import { ContractFactory } from "ethers";

// The deploy script works for BeefyFinance on Polygon Mainnet.
// For other harvesters and/or blockchains change the contract name, keeper registry, vault registry address and gas limits.
const keeperRegistry = "0x7b3EC232b08BD7b4b3305BE0C044D907B2DF960B";
const vaultRegistry = "0x820cE73c7F15C2b828aBE79670D7e61731AB93Be";
const config = {
  harvester: {
    contractName: "BeefyHarvester",
    args: {
      vaultRegistry,
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
  const BeefyHarvesterFactory = await ethers.getContractFactory(
    config.harvester.contractName
  );

  const {
    vaultRegistry,
    keeperRegistry,
    performUpkeepGasLimit,
    performUpkeepGasLimitBuffer,
    vaultHarvestFunctionGasOverhead,
    keeperRegistryGasOverhead,
  } = config.harvester.args;

  const harvesterConstructorArguments: any[] = [
    vaultRegistry,
    keeperRegistry,
    performUpkeepGasLimit,
    performUpkeepGasLimitBuffer,
    vaultHarvestFunctionGasOverhead,
    keeperRegistryGasOverhead,
  ];

  await deployContract(
    config.harvester.contractName,
    BeefyHarvesterFactory,
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
