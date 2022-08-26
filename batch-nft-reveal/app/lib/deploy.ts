import { ContractFactory, Signer } from 'ethers'

import NFTCollection from '../artifacts/contracts/NFTCollection.sol/NFTCollection.json'
import {
  VRF_CALLBACK_GAS_LIMIT,
  VRF_COORDINATOR_V2_ADDRESS,
  VRF_GAS_LANE,
} from '../conf/config'
import NFTCollectionParams from '../types/NFTCollectionParams'

export async function deployNFTCollection(
  nftParams: NFTCollectionParams,
  signer: Signer,
  chainId: number
) {
  const nftCollection = new ContractFactory(
    NFTCollection.abi,
    NFTCollection.bytecode,
    signer
  )
  const deployedContract = await nftCollection.deploy(
    nftParams.nftName,
    nftParams.nftSymbol,
    nftParams.nftMaxSupply,
    nftParams.nftMintCost,
    nftParams.nftRevealBatchSize,
    nftParams.nftRevealInterval,
    VRF_COORDINATOR_V2_ADDRESS[chainId],
    nftParams.vrfSubscriptionId,
    VRF_GAS_LANE[chainId],
    VRF_CALLBACK_GAS_LIMIT
  )

  const tx = await deployedContract.deployTransaction.wait(1)
  return tx
}
