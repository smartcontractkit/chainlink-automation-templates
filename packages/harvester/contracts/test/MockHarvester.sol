//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../base/KeeperCompatibleHarvester.sol";

contract MockHarvester is KeeperCompatibleHarvester {
    uint256 public vaultCount;
    bool public canHarvest;
    bool public shouldHarvest;
    bool public didHarvest;

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
        setCanHarvestVault(true);
        setShouldHarvestVault(true);
        setHarvestVault(true);
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
        view
        override
        returns (bool canHarvest_)
    {
        return canHarvest;
    }

    function _shouldHarvestVault(address)
        internal
        view
        override
        returns (
            bool shouldHarvestVault_,
            uint256 txCostWithPremium_,
            uint256 callRewardAmount_
        )
    {
        return (shouldHarvest, 0, 0);
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
        view
        override
        returns (bool didHarvest_, uint256 callRewards_)
    {
        return (didHarvest, 0);
    }

    function setVaultCount(uint256 newVaultCount) public {
        vaultCount = newVaultCount;
    }

    function setCanHarvestVault(bool _canHarvest) public {
        canHarvest = _canHarvest;
    }

    function setShouldHarvestVault(bool _shouldHarvest) public {
        shouldHarvest = _shouldHarvest;
    }

    function setHarvestVault(bool _didHarvest) public {
        didHarvest = _didHarvest;
    }
}
