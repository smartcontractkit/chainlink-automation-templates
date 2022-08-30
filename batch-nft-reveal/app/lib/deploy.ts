import { Contract, ContractFactory, ethers, Signer } from 'ethers'
import { TransactionReceipt } from '@ethersproject/abstract-provider/lib/index'

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
): Promise<{tx: TransactionReceipt | undefined, error: string}> {
  let nftCollection: ContractFactory
  try {
    nftCollection = new ContractFactory(
      NFTCollection.abi,
      NFTCollection.bytecode,
      signer
    )
  } catch {
    return {tx: undefined, error: 'Contract missing or corrupted'}
  }

  let deployedContract: Contract
  try {
    deployedContract = await nftCollection.deploy(
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
  } catch(ex) {
    console.log(ex)
    const message = ex.message
    const error = message.substring(message.indexOf(':') + 1).trim()
    return { tx: undefined, error: error }
  }

  let tx: TransactionReceipt
  try {
    tx = await deployedContract.deployTransaction.wait(1)
  } catch {
    return {tx: undefined, error: 'Transaction is rejected'}
  }
  return {tx: tx, error: ''}
}
