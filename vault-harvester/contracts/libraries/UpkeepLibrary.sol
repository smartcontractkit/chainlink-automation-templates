// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library UpkeepLibrary {
    uint256 public constant CHAINLINK_UPKEEPTX_PREMIUM_SCALING_FACTOR = 1 gwei;

    /**
     * @dev Rescues random funds stuck.
     */
    function _getCircularIndex(
        uint256 _index,
        uint256 _offset,
        uint256 _bufferLength
    ) internal pure returns (uint256 circularIndex) {
        circularIndex = (_index + _offset) % _bufferLength;
    }

    function _calculateUpkeepTxCost(
        uint256 _gasprice,
        uint256 _gasOverhead,
        uint256 _chainlinkUpkeepTxPremiumFactor
    ) internal pure returns (uint256 _upkeepTxCost) {
        _upkeepTxCost =
            (_gasprice * _gasOverhead * _chainlinkUpkeepTxPremiumFactor) /
            CHAINLINK_UPKEEPTX_PREMIUM_SCALING_FACTOR;
    }

    function _calculateUpkeepTxCostFromTotalVaultHarvestOverhead(
        uint256 _gasprice,
        uint256 _totalVaultHarvestOverhead,
        uint256 _keeperRegistryOverhead,
        uint256 _chainlinkUpkeepTxPremiumFactor
    ) internal pure returns (uint256 upkeepTxCost) {
        uint256 totalOverhead = _totalVaultHarvestOverhead +
            _keeperRegistryOverhead;

        upkeepTxCost = _calculateUpkeepTxCost(
            _gasprice,
            totalOverhead,
            _chainlinkUpkeepTxPremiumFactor
        );
    }

    function _calculateProfit(uint256 _revenue, uint256 _expenses)
        internal
        pure
        returns (uint256 profit)
    {
        profit = _revenue >= _expenses ? _revenue - _expenses : 0;
    }
}
