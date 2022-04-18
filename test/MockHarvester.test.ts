import { ethers } from "hardhat";
import { expect } from "chai";
import { MockHarvester } from "../typechain";

// Polygon mainnet
const config = {
  keeperRegistry: {
    name: "IKeeperRegistry",
    address: "0x7b3EC232b08BD7b4b3305BE0C044D907B2DF960B",
  },
};

const mockConfig = {
  contractName: "MockHarvester",
  args: {
    keeperRegistry: config.keeperRegistry.address,
    performUpkeepGasLimit: 2500000,
    performUpkeepGasLimitBuffer: 100000,
    vaultHarvestFunctionGasOverhead: 600000,
    keeperRegistryGasOverhead: 80000,
  },
};

const abi = [
  "event HarvestSummary (uint256 indexed blockNumber, uint256 oldStartIndex, uint256 newStartIndex, uint256 gasPrice, uint256 gasUsedByPerformUpkeep, uint256 numberOfSuccessfulHarvests, uint256 numberOfFailedHarvests)",
];

const iface = new ethers.utils.Interface(abi);

describe("MockHarvester", () => {
  let harvester: MockHarvester;

  before(async () => {
    const MockHarvesterFactory = await ethers.getContractFactory(
      mockConfig.contractName
    );
    const deployTx = await MockHarvesterFactory.deploy(
      ...Object.values(mockConfig.args)
    );
    harvester = (await deployTx.deployed()) as unknown as MockHarvester;
  });

  it("should harvest", async () => {
    const { upkeepNeeded_, performData_ } = await harvester.checkUpkeep([]);
    expect(upkeepNeeded_).to.be.true;

    const performUpkeepTx = await harvester.performUpkeep(performData_);
    const performUpkeepTxReceipt = await performUpkeepTx.wait();

    performUpkeepTxReceipt.logs.forEach((log) => {
      expect(log).not.to.be.undefined;
    });
  });

  it("should fit vault harvests within gas limit", async () => {
    await harvester.setVaultCount(10);

    const { performData_ } = await harvester.checkUpkeep([]);
    const performUpkeepTx = await harvester.performUpkeep(performData_);
    const performUpkeepTxReceipt = await performUpkeepTx.wait();

    const [, , , harvestSummary] = performUpkeepTxReceipt.logs;
    const { numberOfSuccessfulHarvests } = iface.parseLog(harvestSummary).args;

    const gasUsed =
      numberOfSuccessfulHarvests *
      mockConfig.args.vaultHarvestFunctionGasOverhead;

    const gasLimit =
      mockConfig.args.performUpkeepGasLimit -
      mockConfig.args.performUpkeepGasLimitBuffer;

    expect(gasUsed).to.be.lte(gasLimit);
  });
});
