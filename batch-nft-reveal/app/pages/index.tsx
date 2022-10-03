import NextLink from 'next/link'
import { Button, Heading, Link, Text } from '@chakra-ui/react'
import { ExternalLinkIcon, ArrowForwardIcon } from '@chakra-ui/icons'
import { Section } from '../components/layout'

function HomeIndex(): JSX.Element {
  return (
    <>
      <Heading as="h1" mb="4">
        Welcome to Chainlink NFT Demo App
      </Heading>
      <Text fontSize="xl">
        Create batch-revealed NFT collections powered by Chainlink Automation
        &amp; VRF.
      </Text>
      <NextLink href="/create" passHref>
        <Button as="a" colorScheme="teal" size="lg" mt="8">
          Get Started <ArrowForwardIcon ml="8px" />
        </Button>
      </NextLink>
      <Section>
        <Heading as="h2" size="md" mb="2">
          VRF
        </Heading>
        <Text mb="4">
          All NFTs in a collection have a unique set of traits which determine
          their value, so it&apos;s important they&apos;re randomly distributed
          amongst the participants of the drop.
        </Text>
        <Text mb="4">
          Using Chainlink VRF in generative art NFT collections is de-facto the
          standard approach for getting provably random source in smart
          contracts. By batching the reveal process, instead of making VRF calls
          for each NFT we can save cost up to 100x (in a collection of 10,000
          with a batch size of 100).
        </Text>
        <Link
          href="https://docs.chain.link/docs/vrf/v2/introduction/"
          isExternal
        >
          Learn More <ExternalLinkIcon mx="2px" />
        </Link>
      </Section>
      <Section>
        <Heading as="h2" size="md" mb="2">
          Automation
        </Heading>
        <Text mb="4">
          The reveal process can be automated and further decentralized by
          having Chainlink Automation call the reveal function when certain
          criteria is met. In this app there are two configurable criterias:
          batch size and time interval.
        </Text>
        <Link
          href="https://docs.chain.link/docs/chainlink-automation/introduction/"
          isExternal
        >
          Learn More <ExternalLinkIcon mx="2px" />
        </Link>
      </Section>
    </>
  )
}

export default HomeIndex
