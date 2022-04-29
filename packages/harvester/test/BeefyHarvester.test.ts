import { ethers, network } from "hardhat";
import { expect } from "chai";
import { BigNumber, CallOverrides } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  BeefyHarvester,
  IBeefyUniV2Zap,
  IBeefyRegistry,
  IBeefyStrategy,
} from "../typechain";

const TIMEOUT = 10 * 60 * 100000;

const startingEtherPerAccount = ethers.utils.parseUnits(
  BigNumber.from(100).toString(),
  "ether"
);

const numberOfTestcases = 2;
const accountFundsBuffer = ethers.utils.parseUnits("1", "ether");
const totalTestcaseFunds = startingEtherPerAccount.sub(accountFundsBuffer);
const totalTestcaseFundsScaledDown = totalTestcaseFunds.div(100);
const fundsPerTestcase = totalTestcaseFundsScaledDown.div(numberOfTestcases);

// Polygon mainnet
const config = {
  vaultRegistry: {
    name: "contracts/Beefy/interfaces/IBeefyRegistry.sol:IBeefyRegistry",
    address: "0x820cE73c7F15C2b828aBE79670D7e61731AB93Be",
  },
  zap: {
    name: "IBeefyUniV2Zap",
    address: "0x540A9f99bB730631BF243a34B19fd00BA8CF315C",
  },
  keeperRegistry: {
    name: "IKeeperRegistry",
    address: "0x7b3EC232b08BD7b4b3305BE0C044D907B2DF960B",
  },
};

const harvesterConfig = {
  contractName: "BeefyHarvester",
  args: {
    vaultRegistry: config.vaultRegistry.address,
    keeperRegistry: config.keeperRegistry.address,
    performUpkeepGasLimit: 2500000,
    performUpkeepGasLimitBuffer: 100000,
    vaultHarvestFunctionGasOverhead: 600000,
    keeperRegistryGasOverhead: 80000,
  },
};

interface TestData {
  vaults: Record<string, string>;
}

const testData: TestData = {
  vaults: {
    quick_eth_matic: "0x8b89477dFde285849E1B07947E25012206F4D674",
    quick_matic_usdc: "0xC1A2e8274D390b67A7136708203D71BF3877f158",
    quick_mai_matic: "0xD6eB31D849eE79B5F5fA1b7c470cDDFa515965cD",
    quick_matic_mana: "0x5e03C75a8728a8E0FF0326baADC95433009424d6",
    quick_matic_wcro: "0x6EfBc871323148d9Fc34226594e90d9Ce2de3da3",
    quick_shib_matic: "0x72B5Cf05770C9a6A99FB8652825884ee36a4BfdA",
  },
};

describe("BeefyHarvester", () => {
  let harvester: BeefyHarvester;
  let vaultRegistry: IBeefyRegistry;
  let zap: IBeefyUniV2Zap;

  let deployer: SignerWithAddress;

  before(async () => {
    [deployer] = await ethers.getSigners();

    const BeefyHarvesterFactory = await ethers.getContractFactory(
      harvesterConfig.contractName
    );
    const deployTx = await BeefyHarvesterFactory.deploy(
      ...Object.values(harvesterConfig.args)
    );
    harvester = (await deployTx.deployed()) as unknown as BeefyHarvester;

    vaultRegistry = (await ethers.getContractAt(
      config.vaultRegistry.name,
      config.vaultRegistry.address
    )) as unknown as IBeefyRegistry;

    zap = (await ethers.getContractAt(
      config.zap.name,
      config.zap.address
    )) as unknown as IBeefyUniV2Zap;
  });

  it("basic multiharvests", async () => {
    // set up gas price
    const gasPrice = ethers.utils.parseUnits("100", "gwei");
    const upkeepOverrides: CallOverrides = {
      gasPrice,
    };
    // fund allocation
    const amountToZap = fundsPerTestcase.div(2);

    // vault registry should have quick_shib_matic
    const { quick_eth_matic } = testData.vaults;
    const vaultInfo = await vaultRegistry.getVaultInfo(quick_eth_matic);

    const { strategy: strategyAddress } = vaultInfo;
    const strategy = (await ethers.getContractAt(
      "IBeefyStrategy",
      strategyAddress
    )) as unknown as IBeefyStrategy;
    const lastHarvestBefore = await strategy.lastHarvest();

    // beef in quick_eth_matic with a large amount to ensure harvestability
    let zapTx = await zap.beefInETH(quick_eth_matic, 0, {
      value: amountToZap,
    });
    await zapTx.wait();
    expect(await deployer.getBalance()).to.be.gt(amountToZap);

    // increase time to enough for harvest to be profitable
    await network.provider.send("evm_increaseTime", [
      12 /* hours */ * 60 /* minutes */ * 60 /* seconds */,
    ]);
    await network.provider.send("evm_mine");

    const callReward = await strategy.callReward();
    const harvestGasLimit = await harvester.vaultHarvestFunctionGasOverhead();

    // manually ensure should harvest
    const expectedTxCost = harvestGasLimit.mul(gasPrice);
    expect(callReward).to.be.gte(expectedTxCost);

    // call checker function and ensure there are profitable harvests
    const { upkeepNeeded, performData } = await harvester.checkUpkeep([]);
    expect(upkeepNeeded).to.be.true;

    const performUpkeepTx = await harvester.performUpkeep(
      performData,
      upkeepOverrides
    );
    const performUpkeepTxReceipt = await performUpkeepTx.wait();

    // check logs
    performUpkeepTxReceipt.logs.forEach((log) => {
      expect(log).not.to.be.undefined;
    });

    // ensure strategy was harvested
    const lastHarvestAfter = await strategy.lastHarvest();
    expect(lastHarvestAfter).to.be.gt(lastHarvestBefore);
  }).timeout(TIMEOUT);
});
