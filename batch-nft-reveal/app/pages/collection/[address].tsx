import { useEthers } from '@usedapp/core'
import { useRouter } from 'next/router'
import { Section } from '../../components/layout'
import { RevealInfo, Mint, Gallery } from '../../components/collection'
import { Error } from '../../components/Error'
import { Loading } from '../../components/Loading'
import { useCollectionContract } from '../../hooks/useCollectionContract'

function Collection(): JSX.Element {
  const router = useRouter()
  const address = router.query.address as string

  const { error: appError } = useEthers()

  const { contract, loading, error } = useCollectionContract(address)

  if (loading) {
    return <Loading />
  }

  if (error) {
    return <Error message={error} />
  }

  if (appError) {
    return null
  }

  return (
    <>
      <Section>
        <Mint collection={contract}></Mint>
      </Section>
      <Section>
        <RevealInfo collection={contract}></RevealInfo>
      </Section>
      <Section>
        <Gallery collection={contract}></Gallery>
      </Section>
    </>
  )
}

export default Collection
