import React from 'react'
import { Text, Heading } from '@chakra-ui/react'
import { Create } from '../components/create'
import { Section } from '../components/layout'

function CreatePage(): JSX.Element {
  return (
    <>
      <Heading as="h1" mb="8">
        Create NFT Collection
      </Heading>
      <Text fontSize="xl">
        Setup batch-revealed NFT collection from a pre-built standard contract.
      </Text>
      <Section>
        <Create />
      </Section>
    </>
  )
}

export default CreatePage
