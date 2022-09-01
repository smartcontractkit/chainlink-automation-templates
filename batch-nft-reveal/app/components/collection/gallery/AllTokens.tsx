import { AddressProp } from '../../../types/AddressProp'
import { decodeBase64ToImageSrc } from '../../../utils/utils'
import { Grid, GridItem, Image, Text } from '@chakra-ui/react'
import { useAllTokens } from '../../../hooks/useAllTokens'

export const AllTokens = (props: AddressProp): JSX.Element => {
  const { contractAddress } = props

  const allTokensUris = useAllTokens(contractAddress)

  const imgAllTokenUris =
    allTokensUris &&
    allTokensUris
      .slice()
      .reverse()
      .map((tokenUri: Array<string>, index: number) => {
        return (
          <GridItem colSpan={1} rowSpan={1} key={index}>
            {<Image src={tokenUri && decodeBase64ToImageSrc(tokenUri)} />}
          </GridItem>
        )
      })
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
