// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

interface INFTCollection {
    function mint(uint256 _amount) external payable;

    function withdrawProceeds() external;

    function revealedCount() external view returns(uint256);

    function lastRevealed() external view returns(uint256);

    function batchSize() external view returns(uint256);

    function revealInterval() external view returns(uint256);

    function mintCost() external view returns (uint256);

    function maxSupply() external view returns (uint256);

    function shouldReveal() external view returns (bool);

    function revealPendingMetadata() external returns (uint256 requestId);

    function setRevealBatchSize(uint256 _revealBatchSize) external;

    function setRevealInterval(uint256 _revealInterval) external;
}
