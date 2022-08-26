import { Config, Rinkeby, Hardhat } from '@usedapp/core'

const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_KEY

const config: Config = {
  networks: [Rinkeby, Hardhat],
  readOnlyChainId: Rinkeby.chainId,
  readOnlyUrls: {
    [Rinkeby.chainId]: 'https://rinkeby.infura.io/v3/' + INFURA_KEY,
  },
}

export default config
