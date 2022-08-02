import { Heading, Code, Text, Box, Divider, Container } from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'

/**
 * Prop Types
 */
interface BatchBoxProps {
  id: number
  entropy: string
  children: React.ReactNode
}

/**
 * Component
 */
export const BatchBox = ({
  id,
  entropy,
  children,
}: BatchBoxProps): JSX.Element => {
  return (
    <Box mt="4">
      <Heading size="sm">Batch #{id}</Heading>
      <Container mt="4">
        <Text fontSize="sm" mb="2">
          <ChevronRightIcon /> Entropy from Chainlink VRF
        </Text>
        <Code colorScheme="teal" overflowWrap="anywhere">
          {entropy}
        </Code>
      </Container>
      <Container my="4">
        <Text fontSize="sm" mb="2">
          <ChevronRightIcon /> NFTs with unique randomness derived from batch
          entropy
        </Text>
        <Box>{children}</Box>
      </Container>
      <Divider />
    </Box>
  )
}
