// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockKeeperRegistry {
    function getConfig()
        external
        pure
        returns (
            uint32 paymentPremiumPPB,
            uint24 blockCountPerTurn,
            uint32 checkGasLimit,
            uint24 stalenessSeconds,
            uint16 gasCeilingMultiplier,
            uint256 fallbackGasPrice,
            uint256 fallbackLinkPrice
        )
    {
        return (0, 0, 0, 0, 0, 0, 0);
    }
}
