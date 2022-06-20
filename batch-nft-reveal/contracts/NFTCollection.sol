// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";
import "base64-sol/base64.sol";
import "./interfaces/IERC20.sol";

contract NFTCollection is
    Ownable,
    ERC721,
    VRFConsumerBase,
    KeeperCompatibleInterface
{
    // STRUCTS

    struct Metadata {
        uint256 startIndex;
        uint256 endIndex;
        uint256 entropy;
    }

    // IMMUTABLE STORAGE

    uint256 public immutable maxSupply;
    uint256 public immutable mintCost;
    address public immutable linkToken;
    uint256 internal immutable linkFee;
    bytes32 internal immutable keyHash;

    // MUTABLE STORAGE

    uint256 public totalSupply = 0;
    uint256 public revealedCount = 0;
    uint256 public revealBatchSize;
    uint256 public revealInterval;
    uint256 public lastRevealed;
    bool public pendingReveal = false;
    Metadata[] public metadatas;

    // ERRORS

    error InvalidAmount();
    error MaxSupplyReached();
    error InsufficientFunds();
    error RevealCriteriaNotMet();
    error InsufficientLINK();
    error WithdrawProceedsFailed();

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        uint256 _mintCost,
        uint256 _revealBatchSize,
        uint256 _revealInterval,
        address _vrfCoordinator,
        address _linkToken,
        uint256 _linkFee,
        bytes32 _linkKeyHash
    ) ERC721(_name, _symbol) VRFConsumerBase(_vrfCoordinator, _linkToken) {
        maxSupply = _maxSupply;
        mintCost = _mintCost;
        revealBatchSize = _revealBatchSize;
        revealInterval = _revealInterval;
        linkToken = _linkToken;
        linkFee = _linkFee;
        keyHash = _linkKeyHash;
    }

    // ACTIONS

    function mint(uint256 _amount) external payable {
        if (_amount == 0) {
            revert InvalidAmount();
        }
        if (totalSupply + _amount >= maxSupply) {
            revert MaxSupplyReached();
        }
        if (msg.value < mintCost * _amount) {
            revert InsufficientFunds();
        }
        for (uint256 i = 1; i <= _amount; i++) {
            _safeMint(msg.sender, totalSupply + i);
        }
        totalSupply += _amount;
    }

    function withdrawProceeds() external onlyOwner {
        (bool sent, ) = payable(owner()).call{value: address(this).balance}("");
        if (!sent) {
            revert WithdrawProceedsFailed();
        }
    }

    // GETTERS

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        (uint256 randomness, bool metadataCleared) = _getTokenRandomness(tokenId);
        string memory svg = _generateSVG(randomness, metadataCleared);
        string memory svgEncoded = _svgToImageURI(svg);
        return _formatTokenURI(svgEncoded);
    }

    function _getTokenRandomness(uint256 tokenId)
        internal
        view
        returns (uint256 randomness, bool metadataCleared)
    {
        for (uint256 i = 0; i < metadatas.length; i++) {
            if (
                tokenId >= metadatas[i].startIndex &&
                tokenId < metadatas[i].endIndex
            ) {
                randomness = uint256(
                    keccak256(abi.encode(metadatas[i].entropy, tokenId))
                );
                metadataCleared = true;
            }
        }
    }

    function _formatTokenURI(string memory imageURI)
        internal
        pure
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                "NFT", // You can add whatever name here
                                '", "description":"Batch-revealed NFT!", "attributes":"", "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function _generateSVG(uint256 _randomness, bool _metadataCleared)
        public
        pure
        returns (string memory)
    {
        string[3] memory parts;

        parts[0] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: serif; font-size: 8px; }</style><rect width="100%" height="100%" fill="black" /><text x="10" y="20" class="base">';

        if (_metadataCleared) {
            parts[1] = _toString(_randomness);
        } else {
            parts[1] = "No randomness assigned";
        }

        parts[2] = "</text></svg>";

        return string(abi.encodePacked(parts[0], parts[1], parts[2]));
    }

    function _svgToImageURI(string memory svg)
        internal
        pure
        returns (string memory)
    {
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(baseURL, svgBase64Encoded));
    }

    function _canReveal() internal view returns (bool) {
        uint256 unrevealedCount = totalSupply - revealedCount;
        if (unrevealedCount == 0) {
            return false;
        }
        bool batchSizeCriteria = false;
        if (revealBatchSize > 0 && unrevealedCount >= revealBatchSize) {
            batchSizeCriteria = true;
        }
        bool intervalCriteria = false;
        if (
            revealInterval > 0 &&
            block.timestamp - lastRevealed > revealInterval
        ) {
            intervalCriteria = true;
        }
        return (batchSizeCriteria || intervalCriteria);
    }

    // VRF

    function revealPendingMetadata() public returns (bytes32 requestId) {
        if (!_canReveal()) {
            revert RevealCriteriaNotMet();
        }
        if (IERC20(linkToken).balanceOf(address(this)) < linkFee) {
            revert InsufficientLINK();
        }
        requestId = requestRandomness(keyHash, linkFee);
        pendingReveal = true;
    }

    function _fulfillRandomnessForMetadata(uint256 randomness) internal {
        metadatas.push(
            Metadata({
                startIndex: revealedCount + 1,
                endIndex: totalSupply + 1,
                entropy: randomness
            })
        );
        revealedCount = totalSupply;
        lastRevealed = block.timestamp;
        pendingReveal = false;
    }

    function fulfillRandomness(bytes32, uint256 randomness)
        internal
        virtual
        override
    {
        _fulfillRandomnessForMetadata(randomness);
    }

    // KEEPERS

    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory)
    {
        upkeepNeeded = !pendingReveal && _canReveal();
    }

    function performUpkeep(bytes calldata) external override {
        revealPendingMetadata();
    }

    // SETTERS

    function setRevealBatchSize(uint256 _revealBatchSize) external onlyOwner {
        revealBatchSize = _revealBatchSize;
    }

    function setRevealInterval(uint256 _revealInterval) external onlyOwner {
        revealInterval = _revealInterval;
    }

    // HELPERS

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
