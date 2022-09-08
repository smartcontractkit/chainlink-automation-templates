import { useRouter } from 'next/router'
import { Text } from '@chakra-ui/react'
import { Section } from '../../components/layout'
import { RevealInfo, Mint, Gallery } from '../../components/collection'

function Collection(): JSX.Element {
  const router = useRouter()
  const address = router.query.address as string

  if (!address) return <Text>Loading...</Text>

  return (
    <>
      <Section>
        <Mint contractAddress={address}></Mint>
      </Section>
      <Section>
        <RevealInfo contractAddress={address}></RevealInfo>
      </Section>
      <Section>
        <Gallery contractAddress={address}></Gallery>
      </Section>
    </>
  )
}

export default Collection
