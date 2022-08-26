import React from 'react'
import { useRouter } from 'next/router'
import { Field, FormikProvider, useFormik } from 'formik'
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Tooltip,
  Divider,
  Center,
  Heading,
  Link,
} from '@chakra-ui/react'
import { useEthers } from '@usedapp/core'
import { ExternalLinkIcon, QuestionIcon } from '@chakra-ui/icons'
import { ethers } from 'ethers'
import { deployNFTCollection } from '../lib/deploy'
import NFTCollectionParams from '../types//NFTCollectionParams'

const isEmpty = (value: string): string => {
  let error: string
  if (!value) {
    error = 'is required'
  }
  return error
}

const isNumber = (value: string) => {
  let error: string
  if (!value) {
    error = 'is required'
  } else if (!value || !/^[0-9]*$/.test(value)) {
    error = 'must be a positive number'
  }
  return error
}

const isPositiveNumber = (value: string) => {
  let error: string = isNumber(value)
  if (!error && Number(value) <= 0) {
    error = 'must be greater then zero'
  }
  return error
}

const isFractionalNumber = (value: string) => {
  let error: string
  if (!value) {
    error = 'is required'
  } else if (!value || !/^(0|([1-9][0-9]*))(\.[0-9]{0,18})?$/.test(value)) {
    error = 'must be positive fractional number'
  }
  return error
}

export const CreateForm = (): JSX.Element => {
  const { account, chainId, library, error } = useEthers()
  const router = useRouter()

  const formik = useFormik({
    initialValues: {
      tokenName: '',
      symbol: '',
      maxSupply: 0,
      mintCost: '',
      revealBatchSize: 0,
      revealInterval: 0,
      vrfSubscriptionId: 0,
    },
    onSubmit: async (values) => {
      const nftCollectionParams: NFTCollectionParams = {
        nftName: values.tokenName,
        nftSymbol: values.symbol,
        nftMaxSupply: values.maxSupply,
        nftMintCost: ethers.utils.parseEther(values.mintCost),
        nftRevealBatchSize: values.revealBatchSize,
        nftRevealInterval: values.revealInterval,
        vrfSubscriptionId: values.vrfSubscriptionId,
      }

      const tx = await deployNFTCollection(
        // const contract = ...
        nftCollectionParams,
        library?.getSigner(),
        chainId
      )

      router.push(
        `/success?address=${tx.contractAddress}&tx=${tx.transactionHash}`
      )
    },
  })

  return (
    <form onSubmit={formik.handleSubmit}>
      <FormikProvider value={formik}>
        <FormControl
          isInvalid={formik.touched.tokenName && !!formik.errors.tokenName}
        >
          <FormLabel htmlFor="tokenName">Name</FormLabel>
          <Field as={Input} bg="white" name="tokenName" validate={isEmpty} />
          {formik.errors.tokenName && formik.touched.tokenName && (
            <FormErrorMessage>Name {formik.errors.tokenName}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl
          mt="4"
          isInvalid={formik.touched.symbol && !!formik.errors.symbol}
        >
          <FormLabel htmlFor="symbol">Symbol</FormLabel>
          <Field as={Input} bg="white" name="symbol" validate={isEmpty} />
          {formik.errors.symbol && formik.touched.symbol && (
            <FormErrorMessage>Symbol {formik.errors.symbol}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl
          mt="4"
          isInvalid={formik.touched.maxSupply && !!formik.errors.maxSupply}
        >
          <FormLabel htmlFor="maxSupply">Max supply</FormLabel>
          <Field
            as={Input}
            bg="white"
            name="maxSupply"
            validate={isPositiveNumber}
          />
          {formik.errors.maxSupply && formik.touched.maxSupply && (
            <FormErrorMessage>
              Max supply {formik.errors.maxSupply}
            </FormErrorMessage>
          )}
        </FormControl>
        <FormControl
          mt="4"
          isInvalid={formik.touched.mintCost && !!formik.errors.mintCost}
        >
          <FormLabel htmlFor="mintCost">Cost to mint (ETH)</FormLabel>
          <Field
            as={Input}
            bg="white"
            name="mintCost"
            validate={isFractionalNumber}
          />
          {formik.errors.mintCost && formik.touched.mintCost && (
            <FormErrorMessage>
              Cost to mint {formik.errors.mintCost}
            </FormErrorMessage>
          )}
        </FormControl>
        <Divider
          orientation="horizontal"
          margin="40px 20px 20px 0px"
          border="width 10px"
        />
        <Center>
          <Tooltip
            label="Using Chainlink VRF in generative art NFT collections is de-facto the standard approach for getting provably random source in smart contracts. By batching the reveal process, instead of making VRF calls for each NFT we can save cost up to 100x (in a collection of 10,000 with batch size of 100)."
            placement="right-start"
            fontSize="xs"
            hasArrow
          >
            <Heading as="h2" size="s" mb="2">
              Chainlink VRF <QuestionIcon w="4" h="4" mx="2" />
            </Heading>
          </Tooltip>
        </Center>
        <FormControl
          my="4"
          isInvalid={
            formik.touched.vrfSubscriptionId &&
            !!formik.errors.vrfSubscriptionId
          }
        >
          <FormLabel htmlFor="vrfSubscriptionId">Subscription ID</FormLabel>
          <Field
            as={Input}
            bg="white"
            name="vrfSubscriptionId"
            validate={isNumber}
          />
          {formik.errors.vrfSubscriptionId &&
            formik.touched.vrfSubscriptionId && (
              <FormErrorMessage>
                Subscription ID {formik.errors.vrfSubscriptionId}
              </FormErrorMessage>
            )}
        </FormControl>
        <Link href="https://vrf.chain.link" isExternal fontSize="small">
          How to Create and Fund a Subscription <ExternalLinkIcon mx="2px" />
        </Link>
        <Divider
          orientation="horizontal"
          margin="40px 20px 20px 0px"
          border="width 10px"
        />
        <Center>
          <Tooltip
            label="The reveal process can be automated and further decentralized by asking Chainlink Keepers to call the reveal function when any of the criterias below is met."
            placement="right-start"
            fontSize="xs"
            hasArrow
          >
            <Heading as="h2" size="s" mb="2">
              Chainlink Keepers <QuestionIcon w="4" h="4" mx="2" />
            </Heading>
          </Tooltip>
        </Center>
        <FormControl
          mt="4"
          isInvalid={
            formik.touched.revealBatchSize && !!formik.errors.revealBatchSize
          }
        >
          <FormLabel htmlFor="revealBatchSize">Batch size</FormLabel>
          <Tooltip
            label="Number of unrevealed NFTs in the queue to trigger the reveal process."
            placement="right-start"
            fontSize="xs"
            hasArrow
          >
            <div>
              <Field
                as={Input}
                bg="white"
                name="revealBatchSize"
                validate={isNumber}
              />
            </div>
          </Tooltip>
          {formik.errors.revealBatchSize && formik.touched.revealBatchSize && (
            <FormErrorMessage>
              Batch size {formik.errors.revealBatchSize}
            </FormErrorMessage>
          )}
        </FormControl>
        <FormControl
          mt="4"
          isInvalid={
            formik.touched.revealInterval && !!formik.errors.revealInterval
          }
        >
          <FormLabel htmlFor="revealInterval">Interval (seconds)</FormLabel>
          <Tooltip
            label="Number of seconds since the last reveal needed to trigger the reveal process. Please note at least 1 unrevealed NFT is required for this criteria to apply."
            placement="right-start"
            fontSize="xs"
            hasArrow
          >
            <div>
              <Field
                as={Input}
                bg="white"
                name="revealInterval"
                validate={isNumber}
              />
            </div>
          </Tooltip>
          {formik.errors.revealInterval && formik.touched.revealInterval && (
            <FormErrorMessage>
              Interval {formik.errors.revealInterval}
            </FormErrorMessage>
          )}
        </FormControl>
        <Tooltip
          hasArrow
          label="Connect to a wallet"
          shouldWrapChildren
          isDisabled={!!account}
        >
          <Button
            mt="8"
            colorScheme="teal"
            type="submit"
            disabled={
              !account ||
              !!error ||
              !formik.dirty ||
              Array.isArray(formik.errors) ||
              Object.values(formik.errors).toString() != ''
            }
          >
            Deploy
          </Button>
        </Tooltip>
      </FormikProvider>
    </form>
  )
}
