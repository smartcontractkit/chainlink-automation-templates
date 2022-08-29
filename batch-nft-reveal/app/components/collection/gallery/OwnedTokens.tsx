import { Grid, GridItem, Image, Text, keyframes } from '@chakra-ui/react'
import { useEthers } from '@usedapp/core'
import { useOwnedTokens } from '../../../hooks/useOwnedTokens'
import { useTokenUris } from '../../../hooks/useTokenUris'
import { AddressProp } from '../../../types/AddressProp'
import { decodeBase64ToImageSrc } from '../../../utils/utils'

export const OwnedTokens = (props: AddressProp): JSX.Element => {
  const { account } = useEthers()
  const { contractAddress } = props

  const ownedTokens = useOwnedTokens(contractAddress, account)
  const ownedTokenUris = useTokenUris(ownedTokens, contractAddress).reverse()

  const spin = keyframes`
  from {opacity: 0;}
  to {opacity: 1;}`
  const fadeInAnimation = `${spin} 0.75s linear`

  const imgOwnedTokenUris = ownedTokenUris.map(
    (tokenUri: Array<string>, index: number) => (
      <GridItem colSpan={1} rowSpan={1} key={index} animation={fadeInAnimation}>
        <Image src={tokenUri && decodeBase64ToImageSrc(tokenUri)} />
      </GridItem>
    )
  )

  return (
    <>
      {imgOwnedTokenUris.length == 0 ? (
        <Text>No tokens minted, yet</Text>
      ) : (
        <Grid templateColumns={'repeat(3, 1fr)'} gridGap={'10px'}>
          {imgOwnedTokenUris}
        </Grid>
      )}
    </>
  )
}
