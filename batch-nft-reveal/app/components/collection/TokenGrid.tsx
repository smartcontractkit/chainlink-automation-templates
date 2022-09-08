import { Text, Image, Grid, GridItem } from '@chakra-ui/react'
import { decodeBase64ToImageSrc } from '../../utils/utils'

interface TokenGridProps {
  tokenUris: string[]
}

export const TokenGrid = ({ tokenUris }: TokenGridProps) => {
  const hasTokens = tokenUris.length > 0

  return (
    <>
      {!hasTokens && <Text>No tokens minted, yet</Text>}
      {hasTokens && (
        <Grid templateColumns={'repeat(3, 1fr)'} gridGap={'10px'}>
          {tokenUris.map((uri: string, idx: number) => {
            return (
              <GridItem colSpan={1} rowSpan={1} key={idx}>
                <Image src={uri && decodeBase64ToImageSrc(uri)} />
              </GridItem>
            )
          })}
        </Grid>
      )}
    </>
  )
}
