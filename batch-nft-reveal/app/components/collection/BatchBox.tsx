import { Heading, Code, Text, Box, Divider } from '@chakra-ui/react'

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
      <Box mt="2">
        <Text fontSize="sm" textAlign="center" mb="2">
          Entropy from Chainlink VRF
        </Text>
        <Code colorScheme="teal" overflowWrap="anywhere">
          {entropy}
        </Code>
      </Box>
      <Box mt="4">
        <Text fontSize="sm" textAlign="center" mb="2">
          NFTs with unique randomness derived from batch entropy
        </Text>
        <Box mb="4">{children}</Box>
      </Box>
      <Divider />
    </Box>
  )
}
