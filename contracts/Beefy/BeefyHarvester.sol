//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "beefy-proto/contracts/BIFI/keepers/interfaces/IBeefyVault.sol";
import "beefy-proto/contracts/BIFI/keepers/interfaces/IBeefyStrategy.sol";
import "beefy-proto/contracts/BIFI/keepers/interfaces/IBeefyRegistry.sol";
import "../base/KeeperCompatibleHarvester.sol";

contract BeefyHarvester is KeeperCompatibleHarvester {
    IBeefyRegistry public _vaultRegistry;

    constructor(
        address vaultRegistry_,
        address keeperRegistry_,
        uint256 performUpkeepGasLimit_,
        uint256 performUpkeepGasLimitBuffer_,
        uint256 vaultHarvestFunctionGasOverhead_,
        uint256 keeperRegistryGasOverhead_
    )
        KeeperCompatibleHarvester(
            keeperRegistry_,
            performUpkeepGasLimit_,
            performUpkeepGasLimitBuffer_,
            vaultHarvestFunctionGasOverhead_,
            keeperRegistryGasOverhead_
        )
    {
        _vaultRegistry = IBeefyRegistry(vaultRegistry_);
    }

    function _getVaultAddresses()
        internal
        view
        override
        returns (address[] memory)
    {
        return _vaultRegistry.allVaultAddresses();
    }

    function _canHarvestVault(address vaultAddress_)
        internal
        view
        override
        returns (bool canHarvest_)
    {
        IBeefyVault vault = IBeefyVault(vaultAddress_);
        IBeefyStrategy strategy = IBeefyStrategy(vault.strategy());

        bool isPaused = strategy.paused();

        canHarvest_ = !isPaused;

        return canHarvest_;
    }

    function _shouldHarvestVault(address vaultAddress_)
        internal
        view
        override
        returns (
            bool shouldHarvestVault_,
            uint256 txCostWithPremium_,
            uint256 callRewardAmount_
        )
    {
        IBeefyVault vault = IBeefyVault(vaultAddress_);
        IBeefyStrategy strategy = IBeefyStrategy(vault.strategy());

        /* solhint-disable not-rely-on-time */
        uint256 oneDayAgo = block.timestamp - 1 days;
        bool hasBeenHarvestedToday = strategy.lastHarvest() > oneDayAgo;
        /* solhint-enable not-rely-on-time */

        callRewardAmount_ = strategy.callReward();

        uint256 vaultHarvestGasOverhead = _getVaultHarvestGasOverhead(
            vaultAddress_
        );
        txCostWithPremium_ = _calculateTxCostWithPremium(
            vaultHarvestGasOverhead
        );
        bool isProfitableHarvest = callRewardAmount_ >= txCostWithPremium_;

        shouldHarvestVault_ =
            isProfitableHarvest ||
            (!hasBeenHarvestedToday && callRewardAmount_ > 0);

        return (shouldHarvestVault_, txCostWithPremium_, callRewardAmount_);
    }

    function _getVaultHarvestGasOverhead(address)
        internal
        view
        override
        returns (uint256)
    {
        return
            _estimateSingleVaultHarvestGasOverhead(
                _vaultHarvestFunctionGasOverhead
            );
    }

    function _harvestVault(address vault_)
        internal
        override
        returns (bool didHarvest_, uint256 callRewards_)
    {
        IBeefyStrategy strategy = IBeefyStrategy(
            IBeefyVault(vault_).strategy()
        );
        callRewards_ = strategy.callReward();
        try strategy.harvest(_callFeeRecipient) {
            didHarvest_ = true;
        } catch {
            // try old function signature
            try strategy.harvestWithCallFeeRecipient(_callFeeRecipient) {
                didHarvest_ = true;
                /* solhint-disable no-empty-blocks */
            } catch {
                /* solhint-enable no-empty-blocks */
            }
        }

        return (didHarvest_, callRewards_);
    }
}
