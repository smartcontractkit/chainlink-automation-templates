import {
  Box,
  Button,
  Container,
  Heading,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useContractFunction, useEthers } from '@usedapp/core'
import { Contract } from '@ethersproject/contracts'
import { useContractCall } from '../../hooks/useContractCall'
import { providers, utils, BigNumber } from 'ethers'
import json from '../../artifacts/contracts/NFTCollection.sol/NFTCollection.json'
import { AddressProp } from '../../types/AddressProp'
import { Error } from '../Error'

export const Mint = (props: AddressProp): JSX.Element => {
  let contract: Contract

  const { account } = useEthers()
  const { contractAddress } = props
  const { abi } = json

  const name: string = useContractCall('name', [], contractAddress)
  const symbol: string = useContractCall('symbol', [], contractAddress)
  const totalSupply: BigNumber = useContractCall(
    'totalSupply',
    [],
    contractAddress
  )
  const costToMint: BigNumber = useContractCall('mintCost', [], contractAddress)
  const maxSupply: BigNumber = useContractCall('maxSupply', [], contractAddress)

  const hasReachedMaxSupply =
    totalSupply && maxSupply && totalSupply.gte(maxSupply) ? true : false

  const [mintAmount, setMintAmount] = useState(1)
  const [isMintDisabled, setIsMintDisabled] = useState(false)

  if (contractAddress) {
    contract = new Contract(
      contractAddress,
      new utils.Interface(abi),
      providers.getDefaultProvider()
    )
  }

  const { send, state } = useContractFunction(contract, 'mint', {})
  const isLoading = state.status === 'Mining'

  return (
    <Container maxWidth="100%" centerContent>
      <Heading>
        {name || ''}
        {symbol ? `(${symbol})` : '...'}
      </Heading>
      <Box
        d="flex"
        marginTop={{
          base: '5',
        }}
      >
        <NumberInput
          defaultValue={1}
          min={1}
          width="20"
          onChange={(valueAsString: string, valueAsNumber: number) => {
            // checks if new value is not a number
            // in JS NaN == NaN equals false so isNaN() is necessary.
            if (isNaN(parseInt(valueAsString))) {
              setIsMintDisabled(true)
            } else {
              setIsMintDisabled(false)
            }
            setMintAmount(valueAsNumber)
          }}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Button
          isLoading={isLoading}
          colorScheme="teal"
          disabled={
            isMintDisabled || !account || hasReachedMaxSupply || isLoading
          }
          marginLeft="4"
          onClick={() => {
            send(mintAmount, {
              value: costToMint.mul(mintAmount),
            })
          }}
        >
          Mint
        </Button>
      </Box>
      <Text mt="4">
        {totalSupply ? totalSupply.toString() : 0}/
        {maxSupply ? maxSupply.toString() : 0} minted{' '}
      </Text>
      {state.errorMessage && <Error message={state.errorMessage} />}
    </Container>
  )
}
