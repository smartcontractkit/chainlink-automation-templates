import React, { useCallback, useState } from 'react'
import { useEthers } from '@usedapp/core'
import { Text, Heading } from '@chakra-ui/react'
import { Section } from '../components/layout'
import { CreateForm } from '../components/CreateForm'
import { SuccessDialog } from '../components/SuccessDialog'
import { deployNFTCollection } from '../lib/deploy'
import CreateFormValues from '../types//CreateFormValues'

interface DeployedContract {
  address: string
  txHash: string
}

function CreatePage(): JSX.Element {
  const { chainId, library } = useEthers()
  const [deployedContract, setDeployedContract] = useState<
    DeployedContract | undefined
  >()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onSubmit = useCallback(
    async (args: CreateFormValues) => {
      setIsLoading(true)
      try {
        const tx = await deployNFTCollection(
          args,
          library?.getSigner(),
          chainId
        )
        setIsLoading(false)
        setDeployedContract({
          address: tx.contractAddress,
          txHash: tx.transactionHash,
        })
      } catch (err) {
        setIsLoading(false)
      }
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
        {deployedContract && (
          <SuccessDialog
            contractAddress={deployedContract.address}
            deployTxHash={deployedContract.txHash}
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
