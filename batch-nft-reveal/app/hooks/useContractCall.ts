import { useContractCall as useDappContractCall } from '@usedapp/core'
import { utils } from 'ethers'
import json from '../artifacts/contracts/NFTCollection.sol/NFTCollection.json'

export function useContractCall<T>(
  method: string,
  args: any[],
  addr: string
): T | undefined {
  const { abi } = json
  const [result] =
    useDappContractCall({
      abi: new utils.Interface(abi),
      address: addr,
      method,
      args,
    }) ?? []
  return result as T
}
