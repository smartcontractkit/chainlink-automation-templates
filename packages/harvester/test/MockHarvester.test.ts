import { ethers } from "hardhat";
import { expect } from "chai";
import { MockHarvester, MockKeeperRegistry } from "../typechain";

const harvesterConfig = {
  contractName: "MockHarvester",
  args: {
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
  let keeperRegistry: MockKeeperRegistry;

  before(async () => {
    const MockKeeperRegistry = await ethers.getContractFactory(
      "MockKeeperRegistry"
    );
    keeperRegistry = await MockKeeperRegistry.deploy();

    const MockHarvesterFactory = await ethers.getContractFactory(
      harvesterConfig.contractName
    );
    harvester = (await MockHarvesterFactory.deploy(
      ...[keeperRegistry.address, ...Object.values(harvesterConfig.args)]
    )) as unknown as MockHarvester;
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
      harvesterConfig.args.vaultHarvestFunctionGasOverhead;

    const gasLimit =
      harvesterConfig.args.performUpkeepGasLimit -
      harvesterConfig.args.performUpkeepGasLimitBuffer;

    expect(gasUsed).to.be.lte(gasLimit);
  });
});
