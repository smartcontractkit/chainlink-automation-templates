import { AddressProp } from '../../../types/AddressProp'
import { decodeBase64ToImageSrc } from '../../../utils/utils'
import { Grid, GridItem, Image, Text, keyframes } from '@chakra-ui/react'
import { useAllTokens } from '../../../hooks/useAllTokens'

export const AllTokens = (props: AddressProp): JSX.Element => {
  const { contractAddress } = props

  const allTokensUris = useAllTokens(contractAddress).reverse()

  const spin = keyframes`
  from {opacity: 0;}
  to {opacity: 1;}
`
  const fadeInAnimation = `${spin} 0.75s linear`

  const imgAllTokenUris = allTokensUris.map(
    (tokenUri: Array<string>, index: number) => {
      return (
        <GridItem
          colSpan={1}
          rowSpan={1}
          key={index}
          animation={fadeInAnimation}
        >
          <Image src={tokenUri && decodeBase64ToImageSrc(tokenUri)} />
        </GridItem>
      )
    }
  )
  return (
    <>
      {imgAllTokenUris.length == 0 ? (
        <Text>No tokens minted, yet.</Text>
      ) : (
        <Grid templateColumns={'repeat(3, 1fr)'} gridGap={'10px'}>
          {imgAllTokenUris}
        </Grid>
      )}
    </>
  )
}
