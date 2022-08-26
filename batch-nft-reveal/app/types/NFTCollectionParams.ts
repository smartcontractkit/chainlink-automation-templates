import { BigNumber } from 'ethers'

type NFTCollectionParams = {
  nftName: string
  nftSymbol: string
  nftMaxSupply: number
  nftMintCost: BigNumber
  nftRevealBatchSize: number
  nftRevealInterval: number
  vrfSubscriptionId: number
}

export default NFTCollectionParams
