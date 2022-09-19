import { useEthers } from '@usedapp/core'
import { Contract } from 'ethers'
import {
  Container,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Heading,
  Text,
  Link,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useAllTokens } from '../../hooks/useAllTokens'
import { useOwnedTokens } from '../../hooks/useOwnedTokens'
import { TokenGrid } from './TokenGrid'

/**
 * Prop Types
 */
interface GalleryProps {
  collection: Contract
}

/**
 * Components
 */
export const Gallery = ({ collection }: GalleryProps): JSX.Element => {
  const { account } = useEthers()

  const allTokenUris = useAllTokens(collection)
  const allTokenUrisSorted = [...allTokenUris].reverse()

  const ownedTokenUris = useOwnedTokens(collection, account)
  const ownedTokenUrisSorted = [...ownedTokenUris].reverse()

  return (
    <>
      <GalleryInfo />
      <Tabs>
        <TabList>
          <Tab _selected={{ color: 'white', bg: 'teal' }}>All</Tab>
          <Tab _selected={{ color: 'white', bg: 'teal' }}>Owned</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TokenGrid tokenUris={allTokenUrisSorted} />
          </TabPanel>
          <TabPanel>
            <TokenGrid tokenUris={ownedTokenUrisSorted} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  )
}

const GalleryInfo = () => (
  <Container pb="12" textAlign="center">
    <Heading as="h2" size="lg" pb="4">
      Items
    </Heading>
    <Text pb="4">
      In this demo app we generate an SVG image on-chain and display the random
      number as text for demonstration purposes. In reality you may want to use
      it to generate random traits and complex graphics.
    </Text>
    <Link
      href="https://github.com/hackbg/chainlink-keepers-templates/tree/main/batch-nft-reveal#metadata"
      isExternal
    >
      Learn More <ExternalLinkIcon mx="2px" />
    </Link>
  </Container>
)
