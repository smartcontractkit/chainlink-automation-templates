import { useEffect, useState } from 'react'
import { useEthers } from '@usedapp/core'
import { useRouter } from 'next/router'
import { isAddress } from 'ethers/lib/utils'
import { Text } from '@chakra-ui/react'
import { Web3Provider } from '@ethersproject/providers'
import { INFTCollectionInterfaceId } from '../../conf/config'
import { useCollectionCall } from '../../hooks/useCollectionCall'
import { Section } from '../../components/layout'
import { RevealInfo, Mint, Gallery } from '../../components/collection'

async function hasBytecode(library, address): Promise<boolean> {
  if (!isAddress(address)) {
    return false
  }
  const hasBytecode = (await library.getCode(address)) != '0x'
  return !!hasBytecode
}

function Collection(): JSX.Element {
  const router = useRouter()
  const { library } = useEthers()
  const [isContract, setIsContract] = useState<boolean>()
  const address = router.query.address as string

  const isNFTCollection = useCollectionCall(address, 'supportsInterface', [
    INFTCollectionInterfaceId,
  ])

  const isLoading =
    isContract === undefined ||
    address === undefined ||
    (isNFTCollection === undefined && isContract === undefined)

  useEffect(() => {
    if (library instanceof Web3Provider) {
      hasBytecode(library, address).then((value) => {
        setIsContract(value)
      })
    }
  }, [library, address])

  if (isLoading) {
    return <Text>Loading</Text>
  }

  if (!isAddress(address)) {
    return <Text>Invalid Address</Text>
  }

  if (!isContract) {
    return <Text>This is not a contract</Text>
  }

  if (!isNFTCollection) {
    return <Text>This is not an NFTCollection type of contract</Text>
  }

  return (
    <>
      <Section>
        <Mint contractAddress={address}></Mint>
      </Section>
      <Section>
        <RevealInfo contractAddress={address}></RevealInfo>
      </Section>
      <Section>
        <Gallery contractAddress={address}></Gallery>
      </Section>
    </>
  )
}

export default Collection
