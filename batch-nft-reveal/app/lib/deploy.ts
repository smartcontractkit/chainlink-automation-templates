import { Contract, ContractFactory, ethers, Signer } from 'ethers'

import NFTCollection from '../artifacts/contracts/NFTCollection.sol/NFTCollection.json'
import {
  VRF_CALLBACK_GAS_LIMIT,
  VRF_COORDINATOR_V2_ADDRESS,
  VRF_GAS_LANE,
} from '../conf/config'
import CreateFormValues from '../types/CreateFormValues'

export async function deployNFTCollection(
  nftParams: CreateFormValues,
  signer: Signer,
  chainId: number
): Promise<Contract> {
  const nftCollection = new ContractFactory(
    NFTCollection.abi,
    NFTCollection.bytecode,
    signer
  )
  const deployedContract = await nftCollection.deploy(
    nftParams.name,
    nftParams.symbol,
    nftParams.maxSupply,
    ethers.utils.parseEther(nftParams.mintCost),
    nftParams.revealBatchSize,
    nftParams.revealInterval,
    VRF_COORDINATOR_V2_ADDRESS[chainId],
    nftParams.vrfSubscriptionId,
    VRF_GAS_LANE[chainId],
    VRF_CALLBACK_GAS_LIMIT
  )

  return deployedContract
}
