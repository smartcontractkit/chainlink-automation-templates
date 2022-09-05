import { useCall } from '@usedapp/core'
import { Contract, utils } from 'ethers'
import json from '../artifacts/contracts/NFTCollection.sol/NFTCollection.json'

export function useContractCall<T>(
  method: string,
  args: any[],
  addr: string
): T | undefined {
  const { abi } = json
  const { value } =
    useCall({
      contract: new Contract(addr, new utils.Interface(abi)),
      method,
      args,
    }) ?? {}
  return value?.[0] as T
}
