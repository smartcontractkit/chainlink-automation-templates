import { TransactionOptions, useContractFunction } from '@usedapp/core'
import { useCollectionContract } from './useCollectionContract'

export function useCollectionFunction(
  address: string,
  functionName: string,
  options?: TransactionOptions
) {
  const contract = useCollectionContract(address)

  return useContractFunction(contract, functionName, options)
}
