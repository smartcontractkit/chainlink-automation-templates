import { useContractCall } from './useContractCall'
import { BigNumber } from 'ethers'

export function useNextRevealTime(contractAddr: string): BigNumber {
  const lastRevealed: BigNumber = useContractCall(
    'lastRevealed',
    [],
    contractAddr
  )
  const revealedInterval: BigNumber = useContractCall(
    'revealedInterval',
    [],
    contractAddr
  )

  if (lastRevealed && revealedInterval) {
    return lastRevealed.add(revealedInterval)
  }
}
