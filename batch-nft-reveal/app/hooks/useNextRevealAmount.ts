import { useContractCall } from '../hooks/useContractCall'
import { BigNumber } from 'ethers'

export function useNextRevealAmount(contractAddr: string) {
  const totalSupply: BigNumber = useContractCall(
    'totalSupply',
    [],
    contractAddr
  )
  const revealedCount: BigNumber = useContractCall(
    'revealedCount',
    [],
    contractAddr
  )
  const batchSize: BigNumber = useContractCall('batchSize', [], contractAddr)

  if (revealedCount && totalSupply && batchSize) {
    return batchSize.sub(totalSupply).add(revealedCount)
  }
}
