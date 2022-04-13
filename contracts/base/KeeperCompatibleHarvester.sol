//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../libraries/UpkeepLibrary.sol";
import "../interfaces/IKeeperRegistry.sol";
import "../interfaces/IHarvester.sol";

abstract contract KeeperCompatibleHarvester is IHarvester, Ownable {
    using SafeERC20 for IERC20;

    // Contracts.
    IKeeperRegistry public _keeperRegistry;

    // Configuration state variables.
    uint256 public _performUpkeepGasLimit;
    uint256 public _performUpkeepGasLimitBuffer;
    uint256 public _vaultHarvestFunctionGasOverhead; // Estimated average gas cost of calling harvest()
    uint256 public _keeperRegistryGasOverhead; // Gas cost of upstream contract that calls performUpkeep(). This is a private variable on KeeperRegistry.
    uint256 public _chainlinkUpkeepTxPremiumFactor; // Tx premium factor/multiplier scaled by 1 gwei (10**9).
    address public _callFeeRecipient;

    // State variables that will change across upkeeps.
    uint256 public _startIndex;

    constructor(
        address keeperRegistry_,
        uint256 performUpkeepGasLimit_,
        uint256 performUpkeepGasLimitBuffer_,
        uint256 vaultHarvestFunctionGasOverhead_,
        uint256 keeperRegistryGasOverhead_
    ) {
        // Set contract references.
        _keeperRegistry = IKeeperRegistry(keeperRegistry_);

        // Initialize state variables from initialize() arguments.
        _performUpkeepGasLimit = performUpkeepGasLimit_;
        _performUpkeepGasLimitBuffer = performUpkeepGasLimitBuffer_;
        _vaultHarvestFunctionGasOverhead = vaultHarvestFunctionGasOverhead_;
        _keeperRegistryGasOverhead = keeperRegistryGasOverhead_;

        // Initialize state variables derived from initialize() arguments.
        (uint32 paymentPremiumPPB, , , , , , ) = _keeperRegistry.getConfig();
        _chainlinkUpkeepTxPremiumFactor = uint256(paymentPremiumPPB);
    }

    /*             */
    /* checkUpkeep */
    /*             */

    function checkUpkeep(
        bytes calldata checkData_ // unused
    )
        external
        view
        override
        returns (
            bool upkeepNeeded_,
            bytes memory performData_ // array of vaults +
        )
    {
        checkData_; // dummy reference to get rid of unused parameter warning

        // get vaults to iterate over
        address[] memory vaults = _getVaultAddresses();

        // count vaults to harvest that will fit within gas limit
        (
            HarvestInfo[] memory harvestInfo,
            uint256 numberOfVaultsToHarvest,
            uint256 newStartIndex
        ) = _countVaultsToHarvest(vaults);
        if (numberOfVaultsToHarvest == 0)
            return (false, bytes("No vaults to harvest"));

        (
            address[] memory vaultsToHarvest,
            uint256 heuristicEstimatedTxCost,
            uint256 callRewards
        ) = _buildVaultsToHarvest(vaults, harvestInfo, numberOfVaultsToHarvest);

        uint256 nonHeuristicEstimatedTxCost = _calculateExpectedTotalUpkeepTxCost(
                numberOfVaultsToHarvest
            );

        performData_ = abi.encode(
            vaultsToHarvest,
            newStartIndex,
            heuristicEstimatedTxCost,
            nonHeuristicEstimatedTxCost,
            callRewards
        );

        return (true, performData_);
    }

    function _buildVaultsToHarvest(
        address[] memory vaults_,
        HarvestInfo[] memory willHarvestVault_,
        uint256 numberOfVaultsToHarvest_
    )
        internal
        view
        returns (
            address[] memory vaultsToHarvest_,
            uint256 heuristicEstimatedTxCost_,
            uint256 totalCallRewards_
        )
    {
        uint256 vaultPositionInArray;
        vaultsToHarvest_ = new address[](numberOfVaultsToHarvest_);

        // create array of vaults to harvest. Could reduce code duplication from _countVaultsToHarvest via a another function parameter called _loopPostProcess
        for (uint256 offset; offset < vaults_.length; ++offset) {
            uint256 vaultIndexToCheck = UpkeepLibrary._getCircularIndex(
                _startIndex,
                offset,
                vaults_.length
            );
            address vaultAddress = vaults_[vaultIndexToCheck];

            HarvestInfo memory harvestInfo = willHarvestVault_[offset];

            if (harvestInfo.willHarvest) {
                vaultsToHarvest_[vaultPositionInArray] = vaultAddress;
                heuristicEstimatedTxCost_ += harvestInfo.estimatedTxCost;
                totalCallRewards_ += harvestInfo.callRewardsAmount;
                vaultPositionInArray += 1;
            }

            // no need to keep going if we're past last index
            if (vaultPositionInArray == numberOfVaultsToHarvest_) break;
        }

        return (vaultsToHarvest_, heuristicEstimatedTxCost_, totalCallRewards_);
    }

    function _countVaultsToHarvest(address[] memory vaults_)
        internal
        view
        returns (
            HarvestInfo[] memory harvestInfo_,
            uint256 numberOfVaultsToHarvest_,
            uint256 newStartIndex_
        )
    {
        uint256 gasLeft = _calculateAdjustedGasCap();
        uint256 vaultIndexToCheck; // hoisted up to be able to set newStartIndex
        harvestInfo_ = new HarvestInfo[](vaults_.length);

        // count the number of vaults to harvest.
        for (uint256 offset; offset < vaults_.length; ++offset) {
            // _startIndex is where to start in the _vaultRegistry array, offset is position from start index (in other words, number of vaults we've checked so far),
            // then modulo to wrap around to the start of the array, until we've checked all vaults, or break early due to hitting gas limit
            // this logic is contained in _getCircularIndex()
            vaultIndexToCheck = UpkeepLibrary._getCircularIndex(
                _startIndex,
                offset,
                vaults_.length
            );
            address vaultAddress = vaults_[vaultIndexToCheck];

            (
                bool willHarvest,
                uint256 estimatedTxCost,
                uint256 callRewardsAmount
            ) = _willHarvestVault(vaultAddress);

            if (willHarvest && gasLeft >= _vaultHarvestFunctionGasOverhead) {
                gasLeft -= _vaultHarvestFunctionGasOverhead;
                numberOfVaultsToHarvest_ += 1;
                harvestInfo_[offset] = HarvestInfo(
                    true,
                    estimatedTxCost,
                    callRewardsAmount
                );
            }

            if (gasLeft < _vaultHarvestFunctionGasOverhead) {
                break;
            }
        }

        newStartIndex_ = UpkeepLibrary._getCircularIndex(
            vaultIndexToCheck,
            1,
            vaults_.length
        );

        return (harvestInfo_, numberOfVaultsToHarvest_, newStartIndex_);
    }

    function _willHarvestVault(address vaultAddress_)
        internal
        view
        returns (
            bool willHarvestVault_,
            uint256 estimatedTxCost_,
            uint256 callRewardAmount_
        )
    {
        (
            bool shouldHarvestVault,
            uint256 estimatedTxCost,
            uint256 callRewardAmount
        ) = _shouldHarvestVault(vaultAddress_);
        bool canHarvestVault = _canHarvestVault(vaultAddress_);

        willHarvestVault_ = canHarvestVault && shouldHarvestVault;

        return (willHarvestVault_, estimatedTxCost, callRewardAmount);
    }

    function _canHarvestVault(address vaultAddress_)
        internal
        view
        virtual
        returns (bool canHarvest_);

    function _shouldHarvestVault(address vaultAddress_)
        internal
        view
        virtual
        returns (
            bool shouldHarvestVault_,
            uint256 txCostWithPremium_,
            uint256 callRewardAmount_
        );

    /*               */
    /* performUpkeep */
    /*               */

    function performUpkeep(bytes calldata performData) external override {
        (
            address[] memory vaultsToHarvest,
            uint256 newStartIndex,
            uint256 heuristicEstimatedTxCost,
            uint256 nonHeuristicEstimatedTxCost,
            uint256 estimatedCallRewards
        ) = abi.decode(
                performData,
                (address[], uint256, uint256, uint256, uint256)
            );

        _runUpkeep(
            vaultsToHarvest,
            newStartIndex,
            heuristicEstimatedTxCost,
            nonHeuristicEstimatedTxCost,
            estimatedCallRewards
        );
    }

    function _runUpkeep(
        address[] memory vaults_,
        uint256 newStartIndex_,
        uint256 heuristicEstimatedTxCost_,
        uint256 nonHeuristicEstimatedTxCost_,
        uint256 estimatedCallRewards_
    ) internal {
        // Make sure estimate looks good.
        if (estimatedCallRewards_ < nonHeuristicEstimatedTxCost_) {
            emit HeuristicFailed(
                block.number,
                heuristicEstimatedTxCost_,
                nonHeuristicEstimatedTxCost_,
                estimatedCallRewards_
            );
        }

        uint256 gasBefore = gasleft();
        // multi harvest
        require(vaults_.length > 0, "No vaults to harvest");
        (
            uint256 numberOfSuccessfulHarvests,
            uint256 numberOfFailedHarvests,
            uint256 calculatedCallRewards
        ) = _multiHarvest(vaults_);

        // ensure newStartIndex_ is valid and set _startIndex
        uint256 vaultCount = _getVaultAddresses().length;
        require(
            newStartIndex_ >= 0 && newStartIndex_ < vaultCount,
            "newStartIndex_ out of range."
        );
        _startIndex = newStartIndex_;

        uint256 gasAfter = gasleft();
        uint256 gasUsedByPerformUpkeep = gasBefore - gasAfter;

        // split these into their own functions to avoid `Stack too deep`
        _reportProfitSummary(
            gasUsedByPerformUpkeep,
            nonHeuristicEstimatedTxCost_,
            estimatedCallRewards_,
            calculatedCallRewards
        );
        _reportHarvestSummary(
            newStartIndex_,
            gasUsedByPerformUpkeep,
            numberOfSuccessfulHarvests,
            numberOfFailedHarvests
        );
    }

    function _reportHarvestSummary(
        uint256 newStartIndex_,
        uint256 gasUsedByPerformUpkeep_,
        uint256 numberOfSuccessfulHarvests_,
        uint256 numberOfFailedHarvests_
    ) internal {
        emit HarvestSummary(
            block.number,
            // state variables
            _startIndex,
            newStartIndex_,
            // gas metrics
            tx.gasprice,
            gasUsedByPerformUpkeep_,
            // summary metrics
            numberOfSuccessfulHarvests_,
            numberOfFailedHarvests_
        );
    }

    function _reportProfitSummary(
        uint256 gasUsedByPerformUpkeep_,
        uint256 nonHeuristicEstimatedTxCost_,
        uint256 estimatedCallRewards_,
        uint256 calculatedCallRewards_
    ) internal {
        uint256 estimatedTxCost = nonHeuristicEstimatedTxCost_; // use nonHeuristic here as its more accurate
        uint256 estimatedProfit = UpkeepLibrary._calculateProfit(
            estimatedCallRewards_,
            estimatedTxCost
        );

        uint256 calculatedTxCost = _calculateTxCostWithOverheadWithPremium(
            gasUsedByPerformUpkeep_
        );
        uint256 calculatedProfit = UpkeepLibrary._calculateProfit(
            calculatedCallRewards_,
            calculatedTxCost
        );

        emit ProfitSummary(
            // predicted values
            estimatedTxCost,
            estimatedCallRewards_,
            estimatedProfit,
            // calculated values
            calculatedTxCost,
            calculatedCallRewards_,
            calculatedProfit
        );
    }

    function _multiHarvest(address[] memory vaults_)
        internal
        returns (
            uint256 numberOfSuccessfulHarvests_,
            uint256 numberOfFailedHarvests_,
            uint256 cumulativeCallRewards_
        )
    {
        bool[] memory isSuccessfulHarvest = new bool[](vaults_.length);
        for (uint256 i = 0; i < vaults_.length; ++i) {
            (bool didHarvest, uint256 callRewards) = _harvestVault(vaults_[i]);
            // Add rewards to cumulative tracker.
            if (didHarvest) {
                isSuccessfulHarvest[i] = true;
                cumulativeCallRewards_ += callRewards;
            }
        }

        (
            address[] memory successfulHarvests,
            address[] memory failedHarvests
        ) = _getSuccessfulAndFailedVaults(vaults_, isSuccessfulHarvest);

        emit SuccessfulHarvests(block.number, successfulHarvests);
        emit FailedHarvests(block.number, failedHarvests);

        numberOfSuccessfulHarvests_ = successfulHarvests.length;
        numberOfFailedHarvests_ = failedHarvests.length;
        return (
            numberOfSuccessfulHarvests_,
            numberOfFailedHarvests_,
            cumulativeCallRewards_
        );
    }

    function _harvestVault(address vault_)
        internal
        virtual
        returns (bool didHarvest_, uint256 callRewards_);

    function _getSuccessfulAndFailedVaults(
        address[] memory vaults_,
        bool[] memory isSuccessfulHarvest_
    )
        internal
        pure
        returns (
            address[] memory successfulHarvests_,
            address[] memory failedHarvests_
        )
    {
        uint256 successfulCount;
        for (uint256 i = 0; i < vaults_.length; i++) {
            if (isSuccessfulHarvest_[i]) {
                successfulCount += 1;
            }
        }

        successfulHarvests_ = new address[](successfulCount);
        failedHarvests_ = new address[](vaults_.length - successfulCount);
        uint256 successfulHarvestsIndex;
        uint256 failedHarvestIndex;
        for (uint256 i = 0; i < vaults_.length; i++) {
            if (isSuccessfulHarvest_[i]) {
                successfulHarvests_[successfulHarvestsIndex++] = vaults_[i];
            } else {
                failedHarvests_[failedHarvestIndex++] = vaults_[i];
            }
        }

        return (successfulHarvests_, failedHarvests_);
    }

    /*     */
    /* Set */
    /*     */

    function setPerformUpkeepGasLimit(uint256 performUpkeepGasLimit_)
        external
        override
        onlyOwner
    {
        _performUpkeepGasLimit = performUpkeepGasLimit_;
    }

    function setPerformUpkeepGasLimitBuffer(
        uint256 performUpkeepGasLimitBuffer_
    ) external override onlyOwner {
        _performUpkeepGasLimitBuffer = performUpkeepGasLimitBuffer_;
    }

    function setHarvestGasConsumption(uint256 harvestGasConsumption_)
        external
        override
        onlyOwner
    {
        _vaultHarvestFunctionGasOverhead = harvestGasConsumption_;
    }

    /*      */
    /* View */
    /*      */

    function _getVaultAddresses()
        internal
        view
        virtual
        returns (address[] memory);

    function _getVaultHarvestGasOverhead(address vault)
        internal
        view
        virtual
        returns (uint256);

    function _calculateAdjustedGasCap()
        internal
        view
        returns (uint256 adjustedPerformUpkeepGasLimit_)
    {
        return _performUpkeepGasLimit - _performUpkeepGasLimitBuffer;
    }

    function _calculateTxCostWithPremium(uint256 gasOverhead_)
        internal
        view
        returns (uint256 txCost_)
    {
        return
            UpkeepLibrary._calculateUpkeepTxCost(
                tx.gasprice,
                gasOverhead_,
                _chainlinkUpkeepTxPremiumFactor
            );
    }

    function _calculateTxCostWithOverheadWithPremium(
        uint256 totalVaultHarvestOverhead_
    ) internal view returns (uint256 txCost_) {
        return
            UpkeepLibrary._calculateUpkeepTxCostFromTotalVaultHarvestOverhead(
                tx.gasprice,
                totalVaultHarvestOverhead_,
                _keeperRegistryGasOverhead,
                _chainlinkUpkeepTxPremiumFactor
            );
    }

    function _calculateExpectedTotalUpkeepTxCost(
        uint256 numberOfVaultsToHarvest_
    ) internal view returns (uint256 txCost_) {
        uint256 totalVaultHarvestGasOverhead = _vaultHarvestFunctionGasOverhead *
                numberOfVaultsToHarvest_;
        return
            UpkeepLibrary._calculateUpkeepTxCostFromTotalVaultHarvestOverhead(
                tx.gasprice,
                totalVaultHarvestGasOverhead,
                _keeperRegistryGasOverhead,
                _chainlinkUpkeepTxPremiumFactor
            );
    }

    function _estimateSingleVaultHarvestGasOverhead(
        uint256 vaultHarvestFunctionGasOverhead_
    ) internal view returns (uint256 totalGasOverhead_) {
        totalGasOverhead_ =
            vaultHarvestFunctionGasOverhead_ +
            _keeperRegistryGasOverhead;
    }

    /*      */
    /* Misc */
    /*      */

    /**
     * @dev Rescues random funds stuck.
     * @param token_ address of the token to rescue.
     */
    function inCaseTokensGetStuck(address token_) external onlyOwner {
        IERC20 token = IERC20(token_);

        uint256 amount = token.balanceOf(address(this));
        token.safeTransfer(msg.sender, amount);
    }
}
