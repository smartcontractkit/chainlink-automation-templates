# Chainlink Keeper Template: Vault Harvester

[Open in Remix IDE](https://remix.ethereum.org/#url=https://github.com/hackbg/chainlink-keeper-templates/packages/harvester/flatten/BeefyHarvester.flat.sol)

The key component in DeFi yield aggregators are the Vaults in which you stake your crypto tokens. The investment strategy tied to the specific vault will increase your deposited token amount by compounding arbitrary yield farm reward tokens back into your initially deposited asset. The process is called vault harvesting and can be automated by [Chainlink Keepers](https://docs.chain.link/docs/chainlink-keepers/introduction/) while making it more trustless and decentralized.

Main Contracts:

- `KeeperCompatibleHarvester.sol`
  - Abstract contract
  - Iterates vaults from a provided list
  - Fits vaults within upkeep gas limit
  - Provides helper functions to calculate gas consumption and estimate profit
  - Trigger mechanism can be time-based, profit-based or custom
  - Reports profits, successfull and failed harvests
- `BeefyHarvester.sol`
  - Sample implementation of the abstract harvester for [Beefy Finance](https://beefy.finance/)

## Develop

If you want to create an automated vault harvesting powered by Chainlink Keepers you have to create a new contract that inherits the abstract `KeeperCompatibleHarvester` contract and implements the following functions:

- `_getVaultAddresses` provides a list of vault addresses
- `_canHarvestVault` checks if the vault is harvestable (ex: if paused)
- `_shouldHarvestVault` whether vault should be harvested based on a criteria (ex: profit or time passed)
- `_getVaultHarvestGasOverhead` estimated gas consumption overhead for harvesting a vault
- `_harvestVault` defines how to harvest a vault

## Test

To run unit tests for the abstract harvester:

```bash
yarn test
```

To test `BeefyHarvester` you need to start an instance of Hardhat Network that forks mainnet.

For quick start the test suite is configured for Polygon Mainnet which is supported by both Beefy Finance and Chainlink Keepers.

In a separate terminal run:

```bash
RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/api-key yarn net:fork
```

And then run:

```bash
yarn test:beefy
```

## Deploy

To deploy `BeefyHarvester` on `<network>`:

```bash
yarn deploy <network>
```

To test the deploy, execute it on `localhost` while running a mainnet fork local network.

## Misc

To flatten the contract which is used to open and deploy via Remix IDE:

```bash
yarn flatten
```

## References

- [Beefy Contracts](https://github.com/beefyfinance/beefy-contracts)
