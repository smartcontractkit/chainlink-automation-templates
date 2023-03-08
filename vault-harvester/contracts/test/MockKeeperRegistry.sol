// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockKeeperRegistry {
    struct State {
        uint32 nonce;
        uint96 ownerLinkBalance;
        uint256 expectedLinkBalance;
        uint96 totalPremium;
        uint256 numUpkeeps;
        uint32 configCount;
        uint32 latestConfigBlockNumber;
        bytes32 latestConfigDigest;
        uint32 latestEpoch;
        bool paused;
    }

    struct OnchainConfig {
        uint32 paymentPremiumPPB;
        uint32 flatFeeMicroLink;
        uint32 checkGasLimit;
        uint24 stalenessSeconds;
        uint16 gasCeilingMultiplier;
        uint96 minUpkeepSpend;
        uint32 maxPerformGas;
        uint32 maxCheckDataSize;
        uint32 maxPerformDataSize;
        uint256 fallbackGasPrice;
        uint256 fallbackLinkPrice;
        address transcoder;
        address registrar;
    }

    function getState()
        external
        pure
        returns (
            State memory state,
            OnchainConfig memory config,
            address[] memory signers,
            address[] memory transmitters,
            uint8 f
        )
    {}
}
