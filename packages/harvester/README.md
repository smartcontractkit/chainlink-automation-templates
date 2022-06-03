# Chainlink Keeper Template: Vault Harvester

[Open in Remix IDE](https://remix.ethereum.org/#url=https://github.com/hackbg/chainlink-keeper-templates/packages/harvester/flatten/Harvester.flat.sol)

The key component in DeFi yield aggregators are the Vaults in which you stake your crypto tokens. The investment strategy tied to the specific vault will increase your deposited token amount by compounding arbitrary yield farm reward tokens back into your initially deposited asset. The process is called vault harvesting and can be automated by [Chainlink Keepers](https://keepers.chain.link) while making it more trustless and decentralized.

Main Contracts:

- `KeeperCompatibleHarvester.sol`
  - Abstract contract
  - Iterates vaults from a provided list
  - Fits vaults within upkeep gas limit
  - Provides helper functions to calculate gas consumption and estimate profit
  - Trigger mechanism can be time-based, profit-based or custom
  - Reports profits, successfull and failed harvests

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

## Deploy

To deploy your harvester contract, make the necessary changes in the deploy script located in `src/deploy.ts`:

- Change `KeeperRegistry` address to the one deployed on the network you're targeting
- Update the contract name to your `KeeperCompatibleHarvester` based contract name

Then run:

```bash
yarn deploy <network>
```

To test the deploy script, execute it on `localhost` network while running a mainnet fork in a separate terminal:

```bash
RPC_URL=https://example-rpc.com yarn net:fork
```

Check [Supported Networks](https://docs.chain.link/docs/chainlink-keepers/supported-networks/).

## Misc

To flatten the contract which is used to open and deploy via Remix IDE:

```bash
yarn flatten
```

## References

- [Chainlink Keepers Docs](https://docs.chain.link/docs/chainlink-keepers/introduction/)
