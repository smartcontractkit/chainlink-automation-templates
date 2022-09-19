import { useCalls } from '@usedapp/core'
import { Contract } from 'ethers'
import { useCollectionCall } from './useCollectionCall'

export function useOwnedTokens(
  collection: Contract,
  account: string
): string[] {
  const ownerBalance = useCollectionCall<number>(
    account && collection,
    'balanceOf',
    [account]
  )

  const ownedTokensCalls = []
  for (let i = 0; i < ownerBalance; i++) {
    ownedTokensCalls.push({
      contract: collection,
      method: 'tokenOfOwnerByIndex',
      args: [account, i],
    })
  }
  const ownedTokensResult = useCalls(ownedTokensCalls) ?? []
  const ownedTokenIds = ownedTokensResult.map((result) => result?.value?.[0])

  const tokenUrisCalls = ownedTokenIds.map(
    (tokenId) =>
      tokenId && {
        contract: collection,
        method: 'tokenURI',
        args: [tokenId],
      }
  )

  const tokenUris = useCalls(tokenUrisCalls) ?? []

  return tokenUris.map((result) => result?.value?.[0])
}
