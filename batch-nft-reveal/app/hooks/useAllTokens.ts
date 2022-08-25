import { useContractCall } from '../hooks/useContractCall'
import { useContractCalls } from '@usedapp/core'
import json from '../artifacts/contracts/NFTCollection.sol/NFTCollection.json'
import { BigNumber, utils } from 'ethers'

export function useAllTokens(contractAddr: string): Array<Array<string>> {
  const totalSupplyCall: BigNumber = useContractCall(
    'totalSupply',
    [],
    contractAddr
  )
  const ownedTokensCalls = []
  const { abi } = json

  const totalSupply = totalSupplyCall && totalSupplyCall.toNumber()
  for (let i = 1; i <= totalSupply; i++) {
    ownedTokensCalls.push({
      abi: new utils.Interface(abi),
      address: contractAddr,
      method: 'tokenURI',
      args: [i],
    })
  }
  const tokensOfOwners = useContractCalls(ownedTokensCalls)
  return tokensOfOwners
}
