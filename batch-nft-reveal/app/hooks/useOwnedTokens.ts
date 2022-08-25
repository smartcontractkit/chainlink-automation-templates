import { useContractCall } from '../hooks/useContractCall'
import { useContractCalls } from '@usedapp/core'
import json from '../artifacts/contracts/NFTCollection.sol/NFTCollection.json'
import { BigNumber, utils } from 'ethers'

export function useOwnedTokens(
  contractAddr: string,
  account: string
): Array<Array<BigNumber>> {
  const ownerBalanceCall: BigNumber = useContractCall(
    'balanceOf',
    [account],
    contractAddr
  )
  const ownedTokensCalls = []
  const { abi } = json

  const ownerBalance = ownerBalanceCall && ownerBalanceCall.toNumber()
  for (let i = 0; i < ownerBalance; i++) {
    ownedTokensCalls.push({
      abi: new utils.Interface(abi),
      address: contractAddr,
      method: 'tokenOfOwnerByIndex',
      args: [account, i],
    })
  }
  const tokensOfOwners = useContractCalls(ownedTokensCalls)
  return tokensOfOwners
}
