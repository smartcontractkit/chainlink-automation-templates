// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

interface IBeefyUniV2Zap {
    function beefInETH(address beefyVault, uint256 tokenAmountOutMin)
        external
        payable;

    function beefIn(
        address beefyVault,
        uint256 tokenAmountOutMin,
        address tokenIn,
        uint256 tokenInAmount
    ) external;

    function beefOut(address beefyVault, uint256 withdrawAmount) external;

    function beefOutAndSwap(
        address beefyVault,
        uint256 withdrawAmount,
        address desiredToken,
        uint256 desiredTokenOutMin
    ) external;

    function estimateSwap(
        address beefyVault,
        address tokenIn,
        uint256 fullInvestmentIn
    )
        external
        view
        returns (
            uint256 swapAmountIn,
            uint256 swapAmountOut,
            address swapTokenOut
        );

    function checkWETH() external view returns (bool isValid);
}
