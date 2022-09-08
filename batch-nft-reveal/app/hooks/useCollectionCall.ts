import { useCall } from '@usedapp/core'
import { useCollectionContract } from './useCollectionContract'

export function useCollectionCall<T>(
  address: string,
  method: string,
  args = []
): T | undefined {
  const contract = useCollectionContract(address)

  const { value } =
    useCall(
      contract && {
        contract,
        method,
        args,
      }
    ) ?? {}

  return value?.[0] as T
}
