import React from 'react'
import { Text, Link, Alert, AlertIcon, Stack, Box } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { TokenGrid } from './TokenGrid'
import { BatchBox } from './BatchBox'

/**
 * Prop Types
 */
type Batch = {
  startIndex: number
  endIndex: number
  entropy: string
}

interface BatchListProps {
  batches: Batch[]
  tokenUris: string[]
}

/**
 * Components
 */
export const BatchList = ({ batches, tokenUris }: BatchListProps) => {
  const hasBatches = batches.length > 0

  return (
    <>
      <BatchInfoAlert />
      {!hasBatches && <Text>No batches revealed, yet.</Text>}
      {batches.map(
        (batch, idx: number) =>
          batch && (
            <BatchBox key={idx} id={idx + 1} entropy={batch.entropy}>
              <TokenGrid
                tokenUris={tokenUris.slice(batch.startIndex, batch.endIndex)}
              />
            </BatchBox>
          )
      )}
    </>
  )
}

const BatchInfoAlert = () => (
  <Alert status="info" mb="6">
    <AlertIcon />
    <Stack>
      <Text>
        By batching the reveal process, instead of making VRF calls for each NFT
        we can save cost up to 100x (in a collection of 10,000 with a batch size
        of 100).
      </Text>
      <Box>
        <Link
          href="https://github.com/smartcontractkit/chainlink-automation-templates/tree/main/batch-nft-reveal#randomness"
          isExternal
        >
          Learn More <ExternalLinkIcon mx="2px" />
        </Link>
      </Box>
    </Stack>
  </Alert>
)
