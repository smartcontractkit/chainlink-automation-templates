import { useContractCall } from '../hooks/useContractCall'
import { useCalls } from '@usedapp/core'
import json from '../artifacts/contracts/NFTCollection.sol/NFTCollection.json'
import { BigNumber, Contract, utils } from 'ethers'

export function useAllTokens(contractAddr: string): Array<string> {
  const totalSupplyCall: BigNumber = useContractCall(
    'totalSupply',
    [],
    contractAddr
  )
  const ownedTokensCalls = []
  const { abi } = json

  const totalSupply = totalSupplyCall && totalSupplyCall.toNumber()
  const abiInterface = new utils.Interface(abi)
  for (let i = 1; i <= totalSupply; i++) {
    ownedTokensCalls.push({
      contract: new Contract(contractAddr, abiInterface),
      method: 'tokenURI',
      args: [i],
    })
  }
  const tokensOfOwners = useCalls(ownedTokensCalls)
  return tokensOfOwners.map(result => result?.value?.[0])
}
