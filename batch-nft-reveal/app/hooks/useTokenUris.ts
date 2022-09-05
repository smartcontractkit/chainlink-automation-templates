import json from '../artifacts/contracts/NFTCollection.sol/NFTCollection.json'
import { useCalls } from '@usedapp/core'
import { BigNumber, Contract, utils } from 'ethers'

export function useTokenUris(
  tokens: Array<Array<BigNumber>>,
  contractAddr: string
): Array<any> {
  const { abi } = json
  const abiInterface = new utils.Interface(abi)
  const tokenUrisCalls = tokens?.map((ownedToken) => {
    return {
      contract: new Contract(contractAddr, abiInterface),
      method: 'tokenURI',
      args: [ownedToken && ownedToken.toString()],
    }
  }) ?? []

  const tokenUris = useCalls(tokenUrisCalls) ?? []
  return tokenUris.map(result => result?.value?.[0])
}
