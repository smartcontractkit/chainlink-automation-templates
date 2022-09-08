import { useCalls } from '@usedapp/core'
import { useCollectionCall } from './useCollectionCall'
import { useCollectionContract } from './useCollectionContract'

export function useOwnedTokens(
  contractAddress: string,
  account: string
): string[] {
  const contract = useCollectionContract(contractAddress)

  const ownerBalance = useCollectionCall<number>(contractAddress, 'balanceOf', [
    account,
  ])

  const ownedTokensCalls = []
  for (let i = 0; i < ownerBalance; i++) {
    ownedTokensCalls.push({
      contract,
      method: 'tokenOfOwnerByIndex',
      args: [account, i],
    })
  }
  const ownedTokensResult = useCalls(ownedTokensCalls) ?? []
  const ownedTokenIds = ownedTokensResult.map((result) => result?.value?.[0])

  const tokenUrisCalls =
    ownedTokenIds?.map((tokenId) => {
      return {
        contract,
        method: 'tokenURI',
        args: [tokenId],
      }
    }) ?? []

  const tokenUris = useCalls(tokenUrisCalls) ?? []

  return tokenUris.map((result) => result?.value?.[0])
}
