import { useCalls } from '@usedapp/core'
import { Contract } from 'ethers'
import { useCollectionCall } from './useCollectionCall'

export function useBatches(contract: Contract) {
  const batchCount = useCollectionCall<number>(contract, 'batchCount')
  const allBatchesCalls = []
  for (let i = 0; i < batchCount; i++) {
    allBatchesCalls.push({
      contract,
      method: 'batchDetails',
      args: [i],
    })
  }
  const allBatches = useCalls(allBatchesCalls)

  return allBatches.map((result) => {
    const batch = result?.value
    if (batch) {
      return {
        startIndex: Number(batch[0]) - 1,
        endIndex: Number(batch[1]) - 1,
        entropy: String(batch[2]),
      }
    }
  })
}
