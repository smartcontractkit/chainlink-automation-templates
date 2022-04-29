// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "beefy-proto/contracts/BIFI/keepers/interfaces/IBeefyStrategy.sol";

interface IBeefyRegistry {
    function allVaultAddresses() external view returns (address[] memory);

    function getVaultCount() external view returns (uint256 count);

    function getVaultInfo(address vaultAddress)
        external
        view
        returns (
            string memory name,
            IBeefyStrategy strategy,
            bool isPaused,
            address[] memory tokens,
            uint256 blockNumber,
            bool retired,
            uint256 gasOverhead
        );

    function setHarvestFunctionGasOverhead(
        address vaultAddress,
        uint256 gasOverhead
    ) external;
}
