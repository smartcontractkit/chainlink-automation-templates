import { Config, Hardhat, Goerli, ChainId } from '@usedapp/core'

const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_KEY

const config: Config = {
  networks: [Goerli, Hardhat],
  readOnlyUrls: {
    [Goerli.chainId]: 'https://goerli.infura.io/v3/' + INFURA_KEY,
  },
}

export const VRF_GAS_LANE = {
  [ChainId.Goerli]:
    '0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15',
}

export const VRF_COORDINATOR_V2_ADDRESS = {
  [ChainId.Goerli]: '0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D',
}

export const VRF_CALLBACK_GAS_LIMIT = 500000

export default config
