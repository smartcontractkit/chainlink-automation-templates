import moment from 'moment'
import { Text, Box } from '@chakra-ui/react'
import { RevealProp } from '../../../types/RevealProp'

export const NextReveal = (props: RevealProp): JSX.Element => {
  const nextRevealTime =
    props.nextRevealInterval &&
    moment.unix(props.nextRevealInterval.toNumber()).fromNow()

  const nextRevealBatchSize =
    props.nextRevealBatchSize && props.nextRevealBatchSize.toString()
  console.log(nextRevealBatchSize + ' NFTS' || '... ')
  return (
    <>
      <Box marginTop="5">
        <Text fontWeight="bold" as="span" marginRight="3">
          {nextRevealBatchSize ? `${nextRevealBatchSize} NFTS` : '... '}
        </Text>
        <Text as="span">or</Text>
        <Text fontWeight="bold" as="span" marginLeft="3">
          {nextRevealTime || '...'}
        </Text>
      </Box>
    </>
  )
}
