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
  "event SuccessfulHarvests(uint256 indexed blockNumber, address[] successfulVaults)",
  "event FailedHarvests(uint256 indexed blockNumber, address[] failedVaults)",
];

const iface = new ethers.utils.Interface(abi);

describe("KeeperCompatibleHarvester", () => {
  let harvester: MockHarvester;
  let keeperRegistry: MockKeeperRegistry;

  beforeEach(async () => {
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
    const { upkeepNeeded, performData } = await harvester.checkUpkeep([]);
    expect(upkeepNeeded).to.be.true;

    const performUpkeepTx = await harvester.performUpkeep(performData);
    const performUpkeepTxReceipt = await performUpkeepTx.wait();

    performUpkeepTxReceipt.logs.forEach((log) => {
      expect(log).not.to.be.undefined;
    });

    const [successfulHarvestsLog, failedHarvestsLog] = performUpkeepTxReceipt.logs;
    const { successfulVaults } = iface.parseLog(successfulHarvestsLog).args;
    const { failedVaults } = iface.parseLog(failedHarvestsLog).args;

    expect(successfulVaults.length).to.be.gt(0);
    expect(failedVaults.length).to.be.eq(0);
  });

  it("should fit vault harvests within gas limit", async () => {
    await harvester.setVaultCount(10);

    const { performData } = await harvester.checkUpkeep([]);
    const performUpkeepTx = await harvester.performUpkeep(performData);
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

  it("should not harvest because of _canHarvestVault function", async () => {
    await harvester.setCanHarvestVault(false);
    const { upkeepNeeded } = await harvester.checkUpkeep([]);
    expect(upkeepNeeded).to.be.false;
  });

  it("should not harvest because of _shouldHarvestVault function", async () => {
    await harvester.setShouldHarvestVault(false);
    const { upkeepNeeded } = await harvester.checkUpkeep([]);
    expect(upkeepNeeded).to.be.false;
  });

  it("should fail vault harvest", async () => {
    await harvester.setHarvestVault(false);
    const { upkeepNeeded, performData } = await harvester.checkUpkeep([]);
    expect(upkeepNeeded).to.be.true;

    const performUpkeepTx = await harvester.performUpkeep(performData);
    const performUpkeepTxReceipt = await performUpkeepTx.wait();

    performUpkeepTxReceipt.logs.forEach((log) => {
      expect(log).not.to.be.undefined;
    });

    const [SuccessfulHarvests, FailedHarvests, ,] = performUpkeepTxReceipt.logs;
    const { successfulVaults } = iface.parseLog(SuccessfulHarvests).args;
    const { failedVaults } = iface.parseLog(FailedHarvests).args;

    expect(successfulVaults.length).to.be.eq(0);
    expect(failedVaults.length).to.be.gt(0);
  });
});
