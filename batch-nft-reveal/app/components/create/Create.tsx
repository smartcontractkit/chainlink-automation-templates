import React, { useState } from 'react'
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
} from '@chakra-ui/react'
import { useEthers } from '@usedapp/core'
// TODO: uncomment when connect with deploy function
// import { ethers } from 'ethers'
// import { deployNFTCollection } from '../../lib/deploy'
// import NFTCollectionParams from '../../lib/types/NFTCollectionParams'
import { Error } from '../Error'

export const Create = (): JSX.Element => {
  const { account, chainId, library, error } = useEthers()
  const router = useRouter()
  const [deployError, setDeployError] = useState('')

  const formik = useFormik({
    initialValues: {
      tokenName: '',
      symbol: '',
      maxSupply: '',
      mintCost: '',
      revealBatchSize: '',
      revealInterval: '',
      vrfSubscriptionId: '',
    },
    onSubmit: async (values) => {
      console.log(`Send create request with params: ${values.tokenName}, ${values.symbol}, ${values.maxSupply}, 
        ${values.mintCost}, ${values.revealBatchSize}, ${values.revealInterval}, ${values.vrfSubscriptionId}`)
      // TODO: call function for deploy contract here
      // const nftCollectionParams: NFTCollectionParams = {
      //   nftName: values.tokenName,
      //   nftSymbol: values.symbol,
      //   nftMaxSupply: values.maxSupply,
      //   nftMintCost: ethers.utils.parseEther(values.mintCost),
      //   nftRevealBatchSize: values.revealBatchSize,
      //   nftRevealInterval: values.revealInterval,
      //   vrfSubscriptionId: values.vrfSubscriptionId,
      // }

      // const { address, tx } = await deployNFTCollection( // const contract = ...
      //   nftCollectionParams,
      //   library?.getSigner(),
      //   chainId
      // ).catch((err) => setDeployError(err))

      // router.push(`/collection?address=${address}&tx=${tx}`); // /collection/${contract.address}
    },
  })

  const isNotEmpty = (value: string): string => {
    let error: string
    if (!value) {
      error = 'is required'
    }
    return error
  }

  const isNotNumber = (value: string) => {
    let error: string
    if (!value) {
      error = 'is required'
    } else if (!value || !/^[0-9]*$/.test(value)) {
      error = 'must be a positive number'
    }
    return error
  }

  const isNotPositiveNumber = (value: string) => {
    let error: string = isNotNumber(value)
    if (!error && Number(value) <= 0) {
      error = 'must be greater then zero'
    }
    return error
  }

  const isNotFractualNumber = (value: string) => {
    let error: string
    if (!value) {
      error = 'is required'
    } else if (!value || !/^(0|([1-9][0-9]*))(\.[0-9]{0,18})?$/.test(value)) {
      error = 'must be positive fractional number'
    }
    return error
  }

  return (
    <form onSubmit={formik.handleSubmit}>
      <FormikProvider value={formik}>
        <Heading as="h1" mb="8" size="lg">
          Create NFT Collection
        </Heading>
        <FormControl
          mt="4"
          isInvalid={formik.touched.tokenName && !!formik.errors.tokenName}
        >
          <FormLabel htmlFor="tokenName">Name</FormLabel>
          <Field as={Input} bg="white" name="tokenName" validate={isNotEmpty} />
          {formik.errors.tokenName && formik.touched.tokenName && (
            <FormErrorMessage>Name {formik.errors.tokenName}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl
          mt="4"
          isInvalid={formik.touched.symbol && !!formik.errors.symbol}
        >
          <FormLabel htmlFor="symbol">Symbol</FormLabel>
          <Field as={Input} bg="white" name="symbol" validate={isNotEmpty} />
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
            validate={isNotPositiveNumber}
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
          <FormLabel htmlFor="mintCost">Cost(ETH)</FormLabel>
          <Field
            as={Input}
            bg="white"
            name="mintCost"
            validate={isNotFractualNumber}
          />
          {formik.errors.mintCost && formik.touched.mintCost && (
            <FormErrorMessage>
              Cost(ETH) {formik.errors.mintCost}
            </FormErrorMessage>
          )}
        </FormControl>
        <FormControl
          mt="4"
          isInvalid={
            formik.touched.vrfSubscriptionId &&
            !!formik.errors.vrfSubscriptionId
          }
        >
          <FormLabel htmlFor="vrfSubscriptionId">VRF ID</FormLabel>
          <Tooltip
            label="Chainlink VRF subscription ID"
            placement="right-start"
            fontSize="xs"
            hasArrow
          >
            <div>
              <Field
                as={Input}
                bg="white"
                name="vrfSubscriptionId"
                validate={isNotNumber}
              />
            </div>
          </Tooltip>
          {formik.errors.vrfSubscriptionId &&
            formik.touched.vrfSubscriptionId && (
              <FormErrorMessage>
                VRF ID {formik.errors.vrfSubscriptionId}
              </FormErrorMessage>
            )}
        </FormControl>
        <Divider
          id="create-divider"
          orientation="horizontal"
          margin="40px 20px 20px 0px"
          border="width 10px"
        />
        <Center>
          <Tooltip
            label="If the following conditions are met, batch reveal will be fulfilled."
            placement="right-start"
            fontSize="xs"
            hasArrow
          >
            Batch Reveal
          </Tooltip>
        </Center>
        <FormControl
          mt="4"
          isInvalid={
            formik.touched.revealBatchSize && !!formik.errors.revealBatchSize
          }
        >
          <FormLabel htmlFor="revealBatchSize">Batch Size</FormLabel>
          <Field
            as={Input}
            bg="white"
            name="revealBatchSize"
            validate={isNotNumber}
          />
          {formik.errors.revealBatchSize && formik.touched.revealBatchSize && (
            <FormErrorMessage>
              Batch Size {formik.errors.revealBatchSize}
            </FormErrorMessage>
          )}
        </FormControl>
        <FormControl
          mt="4"
          isInvalid={
            formik.touched.revealInterval && !!formik.errors.revealInterval
          }
        >
          <FormLabel htmlFor="revealInterval">Interval(Seconds)</FormLabel>
          <Field
            as={Input}
            bg="white"
            name="revealInterval"
            validate={isNotNumber}
          />
          {formik.errors.revealInterval && formik.touched.revealInterval && (
            <FormErrorMessage>
              Interval(Seconds) {formik.errors.revealInterval}
            </FormErrorMessage>
          )}
        </FormControl>
        <Tooltip
          hasArrow
          label="Connect to a wallet."
          shouldWrapChildren
          isDisabled={!!account}
        >
          <Button
            mt="4"
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
            Submit
          </Button>
        </Tooltip>
        {deployError && <Error message={deployError} />}
      </FormikProvider>
    </form>
  )
}
