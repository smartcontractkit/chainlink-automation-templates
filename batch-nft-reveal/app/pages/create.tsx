import React from 'react'
import { Heading, Container } from '@chakra-ui/react'
import { Create } from '../components/create'
import { Section } from '../components/layout'

function CreatePage(): JSX.Element {
  return (
    <>
      <Section>
        <Container maxW="mt">
          <Create />
        </Container>
      </Section>
    </>
  )
}

export default CreatePage
