import { Container, Heading } from '@chakra-ui/react'
import { useContractCall } from '../../../hooks/useContractCall'
import { useNextRevealAmount } from '../../../hooks/useNextRevealAmount'
import { useNextRevealTime } from '../../../hooks/useNextRevealTime'
import { AddressProp } from '../../../types/AddressProp'
import { NextReveal } from '../reveal-info/NextReveal'

export const RevealInfo = (props: AddressProp): JSX.Element => {
  const { contractAddress } = props

  const nextRevealBatchSize = useNextRevealAmount(contractAddress)
  const nextRevealTime = useNextRevealTime(contractAddress)
  const isPending = useContractCall('pendingReveal', [], contractAddress)

  return (
    <Container maxWidth="100%" textAlign="center">
      {isPending ? (
        <Heading>Pending</Heading>
      ) : (
        <>
          <Heading>Next reveal after</Heading>
          <NextReveal
            nextRevealInterval={nextRevealTime}
            nextRevealBatchSize={nextRevealBatchSize}
          ></NextReveal>
        </>
      )}
    </Container>
  )
}
