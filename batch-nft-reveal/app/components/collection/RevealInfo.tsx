import moment from 'moment'
import { BigNumber } from 'ethers'
import {
  Container,
  Box,
  HStack,
  Spinner,
  Heading,
  Text,
} from '@chakra-ui/react'
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
 * Components
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

  const hasIntervalPassed =
    nextRevealTime && nextRevealTime.toNumber() - Date.now() / 1000 < 0

  return (
    <Container centerContent>
      {shouldReveal && <PendingReveal />}
      {!shouldReveal && (
        <>
          <Heading>Next reveal after</Heading>
          <Box mt="5">
            {hasIntervalPassed && (
              <>
                <Text as="span" fontWeight="bold">
                  1 NFT
                </Text>
                <Text as="span">
                  {' '}
                  (Interval passed {formatTime(nextRevealTime)})
                </Text>
              </>
            )}
            {!hasIntervalPassed && (
              <>
                <Text fontWeight="bold" as="span" mr="3">
                  {nextRevealBatchSize ? `${nextRevealBatchSize} NFTS` : '... '}
                </Text>
                <Text as="span">or</Text>
                <Text fontWeight="bold" as="span" ml="3">
                  {(nextRevealTime && formatTime(nextRevealTime)) || '...'}
                </Text>
              </>
            )}
          </Box>
        </>
      )}
    </Container>
  )
}

const PendingReveal = (): JSX.Element => (
  <HStack spacing="4">
    <Heading>Pending batch reveal</Heading>
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="gray.200"
      color="teal"
      size="lg"
    />
  </HStack>
)
