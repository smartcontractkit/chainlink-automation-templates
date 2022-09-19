import { useCalls } from '@usedapp/core'
import { Contract } from 'ethers'
import { useCollectionCall } from './useCollectionCall'

export function useAllTokens(collection: Contract): string[] {
  const totalSupply = useCollectionCall<number>(collection, 'totalSupply')

  const allTokensCalls = []
  for (let i = 1; i <= totalSupply; i++) {
    allTokensCalls.push({
      contract: collection,
      method: 'tokenURI',
      args: [i],
    })
  }
  const allTokens = useCalls(allTokensCalls)

  return allTokens.map((result) => result?.value?.[0])
}
