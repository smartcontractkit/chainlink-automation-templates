import { useContractCall } from '../hooks/useContractCall'
import { useCalls } from '@usedapp/core'
import json from '../artifacts/contracts/NFTCollection.sol/NFTCollection.json'
import { BigNumber, Contract, utils } from 'ethers'

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
  const abiInterface = new utils.Interface(abi)
  for (let i = 0; i < ownerBalance; i++) {
    ownedTokensCalls.push({
      contract: new Contract(contractAddr, abiInterface),
      method: 'tokenOfOwnerByIndex',
      args: [account, i],
    })
  }
  const tokensOfOwners = useCalls(ownedTokensCalls) ?? []
  return tokensOfOwners.map(result => result?.value?.[0])
}
