import { Config, Rinkeby, Hardhat, ChainId } from '@usedapp/core'

const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_KEY

const config: Config = {
  networks: [Rinkeby, Hardhat],
  readOnlyChainId: Rinkeby.chainId,
  readOnlyUrls: {
    [Rinkeby.chainId]: 'https://rinkeby.infura.io/v3/' + INFURA_KEY,
  },
}

export const VRF_GAS_LANE = {
  [ChainId.Rinkeby]:
    '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc',
}

export const VRF_COORDINATOR_V2_ADDRESS = {
  [ChainId.Rinkeby]: '0x6168499c0cFfCaCD319c818142124B7A15E857ab',
}

export const VRF_CALLBACK_GAS_LIMIT = 500000

export default config
