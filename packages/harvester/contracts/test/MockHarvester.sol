//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../base/KeeperCompatibleHarvester.sol";

contract MockHarvester is KeeperCompatibleHarvester {
    uint256 public vaultCount;

    constructor(
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
        setVaultCount(1);
    }

    function _getVaultAddresses()
        internal
        view
        override
        returns (address[] memory result)
    {
        result = new address[](vaultCount);
    }

    function _canHarvestVault(address)
        internal
        pure
        override
        returns (bool canHarvest_)
    {
        return true;
    }

    function _shouldHarvestVault(address)
        internal
        pure
        override
        returns (
            bool shouldHarvestVault_,
            uint256 txCostWithPremium_,
            uint256 callRewardAmount_
        )
    {
        return (true, 0, 0);
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

    function _harvestVault(address)
        internal
        pure
        override
        returns (bool didHarvest_, uint256 callRewards_)
    {
        return (true, 0);
    }

    function setVaultCount(uint256 newVaultCount) public {
        vaultCount = newVaultCount;
    }
}
