import { useEthers } from '@usedapp/core'
import { Contract, ethers } from 'ethers'
import { useMemo } from 'react'

import NFTCollection from '../artifacts/contracts/NFTCollection.sol/NFTCollection.json'

const { abi } = NFTCollection

export function useCollectionContract<T extends Contract = Contract>(
  address: string | undefined
): T | null {
  const { library } = useEthers()

  return useMemo(() => {
    if (!library) return null
    if (!address) return null

    return new ethers.Contract(address, abi, library.getSigner()) as T
  }, [address, library])
}
