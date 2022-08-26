import React from 'react'
import { Heading, Text } from '@chakra-ui/react'
import { Load } from '../components/load'
import { Section, Layout } from '../components/layout'

function LoadPage(): JSX.Element {
  return (
    <>
      <Heading as="h1" mb="8">
        Open NFT Collection
      </Heading>
      <Text fontSize="xl">
        Navigate to the page of a previously deployed collection.
      </Text>
      <Section>
        <Load />
      </Section>
    </>
  )
}

export default LoadPage
