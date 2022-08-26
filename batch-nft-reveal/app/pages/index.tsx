import { Button, Heading, Text } from '@chakra-ui/react'
import { useEthers } from '@usedapp/core'
import { Layout } from '../components/layout'
import { deployNFTCollection } from '../lib/deploy'
import { ethers } from '@usedapp/core/node_modules/ethers'
import NFTCollectionParams from '../lib/types/NFTCollectionParams'

function HomeIndex(): JSX.Element {
  const { chainId, library } = useEthers()

  return (
    <>
      <Heading as="h1" mb="4">
        Welcome
      </Heading>
      <Button
        onClick={() => {
          const nftCollectionParams: NFTCollectionParams = {
            nftName: 'Your Collection Name',
            nftSymbol: 'ABC',
            nftMaxSupply: 1000,
            nftMintCost: ethers.utils.parseEther('0.1'),
            nftRevealBatchSize: 10,
            nftRevealInterval: 3600,
            vrfSubscriptionId: 0,
          }

          deployNFTCollection(
            nftCollectionParams,
            library?.getSigner(),
            chainId
          )
        }}
      >
        Deploy NFT Collection
      </Button>
      <Text fontSize="xl">...</Text>
    </>
  )
}

export default HomeIndex
