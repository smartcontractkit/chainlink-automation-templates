import { Config, Hardhat, Sepolia, Goerli, ChainId } from '@usedapp/core'

const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_KEY

const config: Config = {
  networks: [Goerli, Sepolia, Hardhat],
  readOnlyUrls: {
    [Goerli.chainId]: 'https://goerli.infura.io/v3/' + INFURA_KEY,
    [Sepolia.chainId]: 'https://sepolia.infura.io/v3/' + INFURA_KEY,
  },
}

export const VRF_GAS_LANE = {
  [ChainId.Goerli]:
    '0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15',
  [ChainId.Sepolia]:
    '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c',
}

export const VRF_COORDINATOR_V2_ADDRESS = {
  [ChainId.Goerli]: '0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D',
  [ChainId.Sepolia]: '0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625',
}

export const VRF_CALLBACK_GAS_LIMIT = 500000

export default config
