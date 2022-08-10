import React from 'react'
import { Heading, Text } from '@chakra-ui/react'
import { Create } from '../components/create'
import { Section, Layout } from '../components/layout'

function CreatePage(): JSX.Element {

  return (
    <Layout>
      <Heading as="h1" mb="8">
        Create NFT Collection
      </Heading>
      <Section>
        <Create />
      </Section>
    </Layout>
  )
}

export default CreatePage
