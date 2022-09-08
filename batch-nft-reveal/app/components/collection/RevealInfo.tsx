import moment from 'moment'
import { BigNumber } from 'ethers'
import { Container, Heading, Text, Box } from '@chakra-ui/react'
import { useCollectionCall } from '../../hooks/useCollectionCall'

/**
 * Constants & Helpers
 */
const formatTime = (timestamp: BigNumber) =>
  moment.unix(timestamp.toNumber()).fromNow()

/**
 * Prop Types
 */
interface RevealInfoProps {
  contractAddress: string
}

/**
 * Component
 */
export const RevealInfo = ({
  contractAddress,
}: RevealInfoProps): JSX.Element => {
  const totalSupply = useCollectionCall<BigNumber>(
    contractAddress,
    'totalSupply'
  )
  const revealedCount = useCollectionCall<BigNumber>(
    contractAddress,
    'revealedCount'
  )
  const batchSize = useCollectionCall<BigNumber>(contractAddress, 'batchSize')
  const nextRevealBatchSize =
    revealedCount &&
    totalSupply &&
    batchSize &&
    batchSize.sub(totalSupply).add(revealedCount)

  const lastRevealed = useCollectionCall<BigNumber>(
    contractAddress,
    'lastRevealed'
  )
  const revealedInterval = useCollectionCall<BigNumber>(
    contractAddress,
    'revealedInterval'
  )
  const nextRevealTime =
    lastRevealed && revealedInterval && lastRevealed.add(revealedInterval)

  const shouldReveal = useCollectionCall<boolean>(
    contractAddress,
    'shouldReveal'
  )

  return (
    <Container textAlign="center">
      {shouldReveal && <Heading>Pending batch reveal</Heading>}
      {!shouldReveal && (
        <>
          <Heading>Next reveal after</Heading>
          <Box mt="5">
            <Text fontWeight="bold" as="span" mr="3">
              {nextRevealBatchSize ? `${nextRevealBatchSize} NFTS` : '... '}
            </Text>
            <Text as="span">or</Text>
            <Text fontWeight="bold" as="span" ml="3">
              {(nextRevealTime && formatTime(nextRevealTime)) || '...'}
            </Text>
          </Box>
        </>
      )}
    </Container>
  )
}
