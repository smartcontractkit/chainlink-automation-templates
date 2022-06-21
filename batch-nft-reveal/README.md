[This template is a WIP]

# Chainlink Keepers Template: Batch NFT Reveal

[Open in Remix IDE](https://remix.ethereum.org/#url=https://github.com/hackbg/chainlink-keepers-templates/batch-nft-reveal/flatten/NFTCollection.flat.sol)

Using Chainlink VRF in generative art NFT collections is de-facto the standard approach for getting provably random source in smart contracts. By batching the reveal process, instead of making VRF calls for each NFT we can save cost up to 100x (in a collection of 10,000 with batch size of 100).

The reveal process can be automated and further decentralized by asking [Chainlink Keepers](https://keepers.chain.link) to call the reveal function when certain criteria is met. In this template there are two configurable criterias: batch size and time interval.

## Randomness

All NFTs in a collection have unique set of traits which determine their value, so it's important they're randomly distributed amongst participants of the drop.

Revealing multiple NFTs with a single random number is achieved by assigning that number as entropy to a range of tokens (batch) and then deriving a new random number for each unique token:

```solidity
uint256 randomness = uint256(keccak256(abi.encode(entropy, tokenId)));
```

## Metadata

NFT metadata is the standard description of an asset which allows applications (like wallets and marketplaces) to present them with rich data. You can learn more about this in the [Metadata Standards Guide](https://docs.opensea.io/docs/metadata-standards) by OpenSea.

In this template we generate an SVG image on-chain and display the random number as text for demonstration purposes. In reality you may want to use it to generate random traits.

Here's an example of how to randomly select the color of an item with the token randomness in Solidity:

```solidity
string[] memory colors = ["red", "blue", "green", "yellow"];
string memory itemColor = colors[randomness % colors.length];
```

You can use that color to fill an SVG shape on-chain or generate more complex art off-chain on a metadata server. Take a look at this full example of an [on-chain generated SVG art](https://github.com/hackbg/chainlink-fullstack/blob/main/packages/hardhat/contracts/RandomSVG.sol).

## Setup

Begin by setting the parameters for the NFT collection as environment variables:

| Name                     | Description                                                                                                                                                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NFT_NAME `              | Name of the collection.                                                                                                                                                                                                                      |
| `NFT_SYMBOL `            | Symbol of the collection. Usually a few capital case letters.                                                                                                                                                                                |
| `NFT_MAX_SUPPLY `        | Maximum amount of tokens that can be minted.                                                                                                                                                                                                 |
| `NFT_MINT_COST `         | Cost to mint a single NFT in Ether.                                                                                                                                                                                                          |
| `NFT_REVEAL_BATCH_SIZE ` | Minimum number of newly minted tokens required to trigger metadata reveal of a new batch. Set `0` to disable.                                                                                                                                |
| `NFT_REVEAL_INTERVAL `   | Minimum time required to pass (in seconds) since last metadata reveal to trigger new batch reveal. It's recommended to be combined with batch size param to prevent unefficient batch revealing (ex: the minumum 1 NFT). Set `0` to disable. |

Note: Either batch size or time interval params must be set or metadata won't be revealed. It's also possible for the contract owner to change these params after contract deployment via the setter functions.

Additionally, you need to set variables required for the Hardhat project:

| Name                | Description                                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NETWORK_RPC_URL`   | Required to deploy to public networks. You can obtain this from websites like [Infura](https://infura.io), [Alchemy](https://www.alchemy.com) or host your own node. |
| `PRIVATE_KEY`       | Deployer's account private key. Can be exported from wallets, i.e. Metamask.                                                                                         |
| `ETHERSCAN_API_KEY` | Verify contract code on Etherscan.                                                                                                                                   |

The easiest way to complete this step is by copying the `.env.example` file into `.env` and replacing the values with your own.

## Test

To run the unit tests on the local Hardhat network:

```bash
yarn test
```

## Deploy

To deploy the collection to a network, run:

```bash
yarn deploy <network>
```

The deploy script (`scripts/deploy.ts`) utilizes an additional config (`helper-hardhat-config.ts`) which contains the parameters required for VRF on test networks like Rinkeby.

However, you still need to manually replace the `subscriptionId` value with your own. To obtain one, you need to [Create and fund a VRF subscription](https://docs.chain.link/docs/get-a-random-number/#create-and-fund-a-subscription).

To have a fully working solution, both [Chainlink VRF](https://docs.chain.link/docs/vrf-contracts/) and [Chainlink Keepers](https://docs.chain.link/docs/chainlink-keepers/supported-networks/) have to be supported on the network.

## Register Upkeep

To automate the metadata reveal with Chainlink’s network of keepers, you need to [register new Upkeeep](https://keepers.chain.link/new) by following this [step-by-step guide](https://docs.chain.link/docs/chainlink-keepers/register-upkeep/).

## Misc

To flatten the contract which is used to open and deploy via Remix IDE:

```bash
yarn flatten
```

## Refs

- [Chainlink Keepers Docs](https://docs.chain.link/docs/chainlink-keepers/introduction/)
- [Chainlink VRF Docs](https://docs.chain.link/docs/chainlink-vrf/)
- [Designing Effective NFT Launches](https://www.paradigm.xyz/2021/10/a-guide-to-designing-effective-nft-launches)
- [Smart Batched Auctions](https://github.com/FrankieIsLost/smart-batched-auction)
