import React from 'react'
import { Heading, Text } from '@chakra-ui/react'
import { OpenForm } from '../components/OpenForm'
import { Section } from '../components/layout'

function OpenPage(): JSX.Element {
  return (
    <>
      <Heading as="h1" mb="8">
        Open NFT Collection
      </Heading>
      <Text fontSize="xl">
        Navigate to the page of a previously deployed collection.
      </Text>
      <Section>
        <OpenForm />
      </Section>
    </>
  )
}

export default OpenPage
