# Chainlink Keepers Template: Vault Harvester

[Open in Remix IDE](https://remix.ethereum.org/#url=https://github.com/hackbg/chainlink-keepers-templates/vault-harvester/flatten/Harvester.flat.sol)

The key component in DeFi yield aggregators are the Vaults in which you stake your crypto tokens. The investment strategy tied to the specific vault will increase your deposited token amount by compounding arbitrary yield farm reward tokens back into your initially deposited asset. The process is called vault harvesting and can be automated by [Chainlink Keepers](https://keepers.chain.link) while making it more trustless and decentralized.

Main Contracts:

- [`KeeperCompatibleHarvester.sol`](./contracts/base/KeeperCompatibleHarvester.sol)
  - Abstract contract
  - Iterates vaults from a provided list
  - Fits vaults within upkeep gas limit
  - Provides helper functions to calculate gas consumption and estimate profit
  - Trigger mechanism can be time-based, profit-based or custom
  - Reports profits, successfull and failed harvests

## Develop

If you want to create an automated vault harvesting powered by Chainlink Keepers you have to create a new contract that inherits the abstract `KeeperCompatibleHarvester` contract and implement all placeholder functions.

In `contracts` create a new `.sol` file:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "../base/KeeperCompatibleHarvester.sol";

contract MyHarvester is KeeperCompatibleHarvester {
  ...
}
```

Inside the contract body, add a constructor which passes all the required parameters to the parent harvester contract:

```solidity
constructor(
    uint256 _additionalParam,
    address _keeperRegistry,
    uint256 _performUpkeepGasLimit,
    uint256 _performUpkeepGasLimitBuffer,
    uint256 _vaultHarvestFunctionGasOverhead,
    uint256 _keeperRegistryGasOverhead
)
    KeeperCompatibleHarvester(
        _keeperRegistry,
        _performUpkeepGasLimit,
        _performUpkeepGasLimitBuffer,
        _vaultHarvestFunctionGasOverhead,
        _keeperRegistryGasOverhead
    )
{
    additionalParam = _additionalParam;
}
```

Any additional params specific to your implementation should be added there as well, if needed.

Next you need to implement the behavoiur for all `virtual` functions from the parent contract:

- `_getVaultAddresses` provides a list of vault addresses

Example:

```solidity
function _getVaultAddresses()
    internal
    view
    override
    returns (address[] memory)
{
    return vaultRegistry.allVaultAddresses();
}
```

- `_canHarvestVault` checks if the vault is harvestable

Example (if paused):

```solidity
function _canHarvestVault(address _vaultAddress)
    internal
    view
    override
    returns (bool canHarvest)
{
    IVault vault = IVault(_vaultAddress);
    bool isPaused = vault.paused();

    canHarvest = !isPaused;

    return canHarvest;
}
```

- `_shouldHarvestVault` whether vault should be harvested based on a criteria

Example (profit and time based):

```solidity
function _shouldHarvestVault(address _vaultAddress)
    internal
    view
    override
    returns (
        bool shouldHarvestVault,
        uint256 txCostWithPremium,
        uint256 callRewardAmount
    )
{
    IVault vault = IVault(_vaultAddress);

    uint256 oneDayAgo = block.timestamp - 1 days;
    bool hasBeenHarvestedToday = vault.lastHarvest() > oneDayAgo;

    callRewardAmount = vault.callReward();

    uint256 vaultHarvestGasOverhead = _getVaultHarvestGasOverhead(
        _vaultAddress
    );
    txCostWithPremium = _calculateTxCostWithPremium(
        vaultHarvestGasOverhead
    );
    bool isProfitableHarvest = callRewardAmount >= txCostWithPremium;

    shouldHarvestVault =
        isProfitableHarvest ||
        (!hasBeenHarvestedToday && callRewardAmount > 0);

    return (shouldHarvestVault, txCostWithPremium, callRewardAmount);
}
```

- `_getVaultHarvestGasOverhead` estimated gas consumption overhead for harvesting a vault

Example:

```solidity
function _getVaultHarvestGasOverhead(address)
    internal
    view
    override
    returns (uint256)
{
    return
        _estimateSingleVaultHarvestGasOverhead(
            vaultHarvestFunctionGasOverhead
        );
}
```

- `_harvestVault` defines how to harvest a vault

Example:

```solidity
function _harvestVault(address _vault)
    internal
    override
    returns (bool didHarvest, uint256 callRewards)
{
    IVault vault = IVault(_vaultAddress);

    callRewards = vault.callReward();
    didHarvest = strategy.harvest(callFeeRecipient);

    return (didHarvest, callRewards);
}
```

Note: Keeper related functions `checkUpkeep` and `performUpkeep` are handled in the base contract, so that you only have to implement domain-specific behavior.

## Test

To run unit tests for the abstract harvester:

```bash
yarn test
```

## Deploy

To deploy your harvester contract, make the necessary changes in the deploy script located in `scripts/deploy.ts`:

- Change `KeeperRegistry` address to the one deployed on the network you're targeting
- Update the contract name to your `KeeperCompatibleHarvester` based contract name
- Set an appropriate value for your vaults harvest function gas overhead
- Change the gas limit depending on how many vault harvests you want to fit in a single upkeep perform transaction

Then run:

```bash
yarn deploy <network>
```

To test the deploy script, execute it on `localhost` network while running a mainnet fork in a separate terminal:

```bash
RPC_URL=https://example-rpc.com yarn net:fork
```

Check [Supported Networks](https://docs.chain.link/docs/chainlink-keepers/supported-networks/).

## Register Upkeep

To automate your harvester contract with Chainlink’s network of keepers, you need to [register new Upkeeep](https://keepers.chain.link/new) by following this [step-by-step guide](https://docs.chain.link/docs/chainlink-keepers/register-upkeep/).

## Misc

To flatten the contract which is used to open and deploy via Remix IDE:

```bash
yarn flatten
```

## References

- [Chainlink Keepers Docs](https://docs.chain.link/docs/chainlink-keepers/introduction/)

> :warning: **Disclaimer**: The code used in Chainlink Keepers Quickstarts templates comes from Chainlink community members and has not been audited. The Chainlink team disclaims and shall have no liability with respect to any loss, malfunction, or any other result of deploying a Quickstart Template. By electing to deploy a Quickstart Template you hereby acknowledge and agree to the above.
