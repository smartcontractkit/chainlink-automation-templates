import { Config, Rinkeby, Hardhat } from '@usedapp/core'

const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_KEY

const config: Config = {
  networks: [Rinkeby, Hardhat],
}

export default config
