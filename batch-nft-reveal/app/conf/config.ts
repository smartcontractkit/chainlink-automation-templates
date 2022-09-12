import { Config, Rinkeby, Hardhat, Goerli, ChainId } from '@usedapp/core'

const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_KEY

const config: Config = {
  networks: [Rinkeby, Goerli, Hardhat],
  readOnlyChainId: Goerli.chainId,
  readOnlyUrls: {
    [Rinkeby.chainId]: 'https://rinkeby.infura.io/v3/' + INFURA_KEY,
    [Goerli.chainId]: 'https://goerli.infura.io/v3/' + INFURA_KEY,
  },
}

export const VRF_GAS_LANE = {
  [ChainId.Rinkeby]:
    '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc',
  [ChainId.Goerli]:
    '0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15',
}

export const VRF_COORDINATOR_V2_ADDRESS = {
  [ChainId.Rinkeby]: '0x6168499c0cFfCaCD319c818142124B7A15E857ab',
  [ChainId.Goerli]: '0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D',
}

export const VRF_CALLBACK_GAS_LIMIT = 500000

export const INFTCollectionInterfaceId = '0xb4fd92d0'

export default config
