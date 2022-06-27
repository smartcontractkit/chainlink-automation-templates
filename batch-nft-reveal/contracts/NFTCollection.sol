// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

contract NFTCollection is
    Ownable,
    ERC721,
    VRFConsumerBaseV2,
    KeeperCompatibleInterface
{
    // STRUCTS

    struct Metadata {
        uint256 startIndex;
        uint256 endIndex;
        uint256 entropy;
    }

    // IMMUTABLE STORAGE

    uint256 private immutable MAX_SUPPLY;
    uint256 private immutable MINT_COST;

    // MUTABLE STORAGE

    uint256 private s_totalSupply;
    uint256 private s_revealedCount;
    uint256 private s_revealBatchSize;
    uint256 private s_revealInterval;
    uint256 private s_lastRevealed = block.timestamp;
    bool private s_pendingReveal;
    Metadata[] private s_metadatas;

    // VRF CONSTANTS & IMMUTABLE

    uint16 private constant VRF_REQUEST_CONFIRMATIONS = 3;
    uint32 private constant VRF_NUM_WORDS = 1;

    VRFCoordinatorV2Interface private immutable VRF_COORDINATOR_V2;
    uint64 private immutable VRF_SUBSCRIPTION_ID;
    bytes32 private immutable VRF_GAS_LANE;
    uint32 private immutable VRF_CALLBACK_GAS_LIMIT;

    // EVENTS

    event BatchRevealRequested(uint256 requestId);
    event BatchRevealFinished(uint256 startIndex, uint256 endIndex);

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
        address _vrfCoordinatorV2,
        uint64 _vrfSubscriptionId,
        bytes32 _vrfGasLane,
        uint32 _vrfCallbackGasLimit
    ) ERC721(_name, _symbol) VRFConsumerBaseV2(_vrfCoordinatorV2) {
        MAX_SUPPLY = _maxSupply;
        MINT_COST = _mintCost;
        VRF_COORDINATOR_V2 = VRFCoordinatorV2Interface(_vrfCoordinatorV2);
        VRF_SUBSCRIPTION_ID = _vrfSubscriptionId;
        VRF_GAS_LANE = _vrfGasLane;
        VRF_CALLBACK_GAS_LIMIT = _vrfCallbackGasLimit;
        s_revealBatchSize = _revealBatchSize;
        s_revealInterval = _revealInterval;
    }

    // ACTIONS

    function mint(uint256 _amount) external payable {
        if (_amount == 0) {
            revert InvalidAmount();
        }
        if (s_totalSupply + _amount > MAX_SUPPLY) {
            revert MaxSupplyReached();
        }
        if (msg.value < MINT_COST * _amount) {
            revert InsufficientFunds();
        }
        for (uint256 i = 1; i <= _amount; i++) {
            _safeMint(msg.sender, s_totalSupply + i);
        }
        s_totalSupply += _amount;
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

    function totalSupply() public view returns (uint256) {
        return s_totalSupply;
    }

    // HELPERS

    function _getTokenRandomness(uint256 tokenId)
        internal
        view
        returns (uint256 randomness, bool metadataCleared)
    {
        for (uint256 i = 0; i < s_metadatas.length; i++) {
            if (
                tokenId >= s_metadatas[i].startIndex &&
                tokenId < s_metadatas[i].endIndex
            ) {
                randomness = uint256(
                    keccak256(abi.encode(s_metadatas[i].entropy, tokenId))
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
                                '{',
                                    '"name":"NFT", ',
                                    '"description":"Batch-revealed NFT!", ',
                                    '"attributes":"", ',
                                    '"image":"', imageURI, '"',
                                '}'
                            )
                        )
                    )
                )
            );
    }

    function _generateSVG(uint256 _randomness, bool _metadataCleared)
        internal
        pure
        returns (string memory)
    {
        string[3] memory parts;

        parts[0] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: serif; font-size: 8px; }</style><rect width="100%" height="100%" fill="black" /><text x="10" y="20" class="base">';

        if (_metadataCleared) {
            parts[1] = Strings.toString(_randomness);
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

    // REVEAL

    function _canReveal() internal view returns (bool) {
        if (s_pendingReveal) {
            return false;
        }
        uint256 unrevealedCount = s_totalSupply - s_revealedCount;
        if (unrevealedCount == 0) {
            return false;
        }
        bool batchSizeCriteria = false;
        if (s_revealBatchSize > 0 && unrevealedCount >= s_revealBatchSize) {
            batchSizeCriteria = true;
        }
        bool intervalCriteria = false;
        if (
            s_revealInterval > 0 &&
            block.timestamp - s_lastRevealed > s_revealInterval
        ) {
            intervalCriteria = true;
        }
        return (batchSizeCriteria || intervalCriteria);
    }

    function revealPendingMetadata() public returns (uint256 requestId) {
        if (!_canReveal()) {
            revert RevealCriteriaNotMet();
        }
        requestId = VRF_COORDINATOR_V2.requestRandomWords(
            VRF_GAS_LANE,
            VRF_SUBSCRIPTION_ID,
            VRF_REQUEST_CONFIRMATIONS,
            VRF_CALLBACK_GAS_LIMIT,
            VRF_NUM_WORDS
        );
        s_pendingReveal = true;
        emit BatchRevealRequested(requestId);
    }

    function _fulfillRandomnessForMetadata(uint256 randomness) internal {
        uint256 startIndex = s_revealedCount + 1;
        uint256 endIndex = s_totalSupply + 1;
        s_metadatas.push(
            Metadata({
                startIndex: startIndex,
                endIndex: endIndex,
                entropy: randomness
            })
        );
        s_revealedCount = s_totalSupply;
        s_lastRevealed = block.timestamp;
        s_pendingReveal = false;
        emit BatchRevealFinished(startIndex, endIndex);
    }

    // VRF

    function fulfillRandomWords(uint256, uint256[] memory randomWords)
        internal
        override
    {
        _fulfillRandomnessForMetadata(randomWords[0]);
    }

    // KEEPERS

    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory)
    {
        upkeepNeeded = _canReveal();
    }

    function performUpkeep(bytes calldata) external override {
        revealPendingMetadata();
    }

    // SETTERS

    function setRevealBatchSize(uint256 _revealBatchSize) external onlyOwner {
        s_revealBatchSize = _revealBatchSize;
    }

    function setRevealInterval(uint256 _revealInterval) external onlyOwner {
        s_revealInterval = _revealInterval;
    }
}
