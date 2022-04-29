//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "beefy-proto/contracts/BIFI/keepers/interfaces/IBeefyVault.sol";
import "beefy-proto/contracts/BIFI/keepers/interfaces/IBeefyStrategy.sol";
import "contracts/Beefy/interfaces/IBeefyRegistry.sol";
import "../base/KeeperCompatibleHarvester.sol";

contract BeefyHarvester is KeeperCompatibleHarvester {
    IBeefyRegistry public vaultRegistry;

    constructor(
        address _vaultRegistry,
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
        vaultRegistry = IBeefyRegistry(_vaultRegistry);
    }

    function _getVaultAddresses()
        internal
        view
        override
        returns (address[] memory)
    {
        return vaultRegistry.allVaultAddresses();
    }

    function _canHarvestVault(address _vaultAddress)
        internal
        view
        override
        returns (bool canHarvest)
    {
        IBeefyVault vault = IBeefyVault(_vaultAddress);
        IBeefyStrategy strategy = IBeefyStrategy(vault.strategy());

        bool isPaused = strategy.paused();

        canHarvest = !isPaused;

        return canHarvest;
    }

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
        IBeefyVault vault = IBeefyVault(_vaultAddress);
        IBeefyStrategy strategy = IBeefyStrategy(vault.strategy());

        /* solhint-disable not-rely-on-time */
        uint256 oneDayAgo = block.timestamp - 1 days;
        bool hasBeenHarvestedToday = strategy.lastHarvest() > oneDayAgo;
        /* solhint-enable not-rely-on-time */

        callRewardAmount = strategy.callReward();

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

    function _harvestVault(address _vault)
        internal
        override
        returns (bool didHarvest, uint256 callRewards)
    {
        IBeefyStrategy strategy = IBeefyStrategy(
            IBeefyVault(_vault).strategy()
        );
        callRewards = strategy.callReward();
        try strategy.harvest(callFeeRecipient) {
            didHarvest = true;
        } catch {
            // try old function signature
            try strategy.harvestWithCallFeeRecipient(callFeeRecipient) {
                didHarvest = true;
                /* solhint-disable no-empty-blocks */
            } catch {
                /* solhint-enable no-empty-blocks */
            }
        }

        return (didHarvest, callRewards);
    }
}
