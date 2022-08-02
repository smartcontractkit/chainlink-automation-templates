import { useCall } from '@usedapp/core'
import { Contract } from 'ethers'

export function useCollectionCall<T>(
  collection: Contract,
  method: string,
  args = []
): T | undefined {
  const { value } =
    useCall(
      collection && {
        contract: collection,
        method,
        args,
      }
    ) ?? {}

  return value?.[0] as T
}
