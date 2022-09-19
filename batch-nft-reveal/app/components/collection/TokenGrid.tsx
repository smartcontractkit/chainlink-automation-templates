import { Text, Image, Grid, GridItem } from '@chakra-ui/react'
import { decodeBase64ToImageSrc } from '../../lib/utils'

/**
 * Prop Types
 */
interface TokenGridProps {
  tokenUris: string[]
}

/**
 * Component
 */
export const TokenGrid = ({ tokenUris }: TokenGridProps) => {
  const hasTokens = tokenUris.length > 0

  return (
    <>
      {!hasTokens && <Text>No tokens minted, yet.</Text>}
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
