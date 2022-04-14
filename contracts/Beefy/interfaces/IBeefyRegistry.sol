// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "beefy-proto/contracts/BIFI/keepers/interfaces/IBeefyStrategy.sol";

interface IBeefyRegistry {
    function allVaultAddresses() external view returns (address[] memory);

    function getVaultCount() external view returns (uint256 count);

    function getVaultInfo(address _vaultAddress)
        external
        view
        returns (
            string memory name_,
            IBeefyStrategy strategy_,
            bool isPaused_,
            address[] memory tokens_,
            uint256 blockNumber_,
            bool retired_,
            uint256 gasOverhead_
        );

    function setHarvestFunctionGasOverhead(
        address vaultAddress_,
        uint256 gasOverhead_
    ) external;
}
