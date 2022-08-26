import json from '../artifacts/contracts/NFTCollection.sol/NFTCollection.json'
import { useContractCalls } from '@usedapp/core'
import { BigNumber, utils } from 'ethers'

export function useTokenUris(
  tokens: Array<Array<BigNumber>>,
  contractAddr: string
): Array<any> {
  const { abi } = json
  const tokenUrisCalls = tokens.map((ownedToken) => {
    return {
      abi: new utils.Interface(abi),
      address: contractAddr,
      method: 'tokenURI',
      args: [ownedToken && ownedToken.toString()],
    }
  })

  const tokenUris = useContractCalls(tokenUrisCalls)
  return tokenUris
}
