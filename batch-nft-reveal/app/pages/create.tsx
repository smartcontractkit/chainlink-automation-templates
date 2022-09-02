import React, { useCallback, useState } from 'react'
import { useEthers } from '@usedapp/core'
import { Text, Heading } from '@chakra-ui/react'
import { Section } from '../components/layout'
import { CreateForm } from '../components/CreateForm'
import { SuccessDialog } from '../components/SuccessDialog'
import { Error } from '../components/Error'
import { deployNFTCollection } from '../lib/deploy'
import CreateFormValues from '../types//CreateFormValues'

interface DeployedContract {
  address: string
  txHash: string
  name: string
}

function CreatePage(): JSX.Element {
  const { chainId, library } = useEthers()
  const [deployedContract, setDeployedContract] = useState<
    DeployedContract | undefined
  >()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState('')

  const onSubmit = useCallback(
    async (args: CreateFormValues) => {
      setError('')
      setIsLoading(true)
      let tx
      try {
        const contract = await deployNFTCollection(
          args,
          library?.getSigner(),
          chainId
        )
        tx = await contract.deployTransaction.wait(0)
      } catch (ex) {
        ex.message ? setError(ex.message) : setError('Unsuccessful deployment')
        setIsLoading(false)
        return
      }
      setDeployedContract({
        address: tx.contractAddress,
        txHash: tx.transactionHash,
        name: args.name,
      })
      setIsLoading(false)
    },
    [library, chainId]
  )

  return (
    <>
      <Heading as="h1" mb="8">
        Create NFT Collection
      </Heading>
      <Text fontSize="xl">
        Setup batch-revealed NFT collection from a pre-built standard contract.
      </Text>
      <Section>
        {error && <Error message={error} />}
        {deployedContract && (
          <SuccessDialog
            contractAddress={deployedContract.address}
            deployTxHash={deployedContract.txHash}
            collectionName={deployedContract.name}
          />
        )}
        {!deployedContract && (
          <CreateForm onSubmit={onSubmit} isLoading={isLoading} />
        )}
      </Section>
    </>
  )
}

export default CreatePage
