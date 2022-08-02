import { Heading, Text } from '@chakra-ui/react'
import { Layout } from '../components/layout'

function HomeIndex(): JSX.Element {
  return (
    <Layout>
      <Heading as="h1" mb="4">
        Welcome
      </Heading>
      <Text fontSize="xl">...</Text>
    </Layout>
  )
}

export default HomeIndex
