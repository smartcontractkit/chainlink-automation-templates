import { useCalls } from '@usedapp/core'
import { useCollectionCall } from './useCollectionCall'
import { useCollectionContract } from './useCollectionContract'

export function useAllTokens(contractAddress: string): string[] {
  const contract = useCollectionContract(contractAddress)

  const totalSupply = useCollectionCall<number>(contractAddress, 'totalSupply')

  const allTokensCalls = []
  for (let i = 1; i <= totalSupply; i++) {
    allTokensCalls.push({
      contract,
      method: 'tokenURI',
      args: [i],
    })
  }
  const allTokens = useCalls(allTokensCalls)

  return allTokens.map((result) => result?.value?.[0])
}
