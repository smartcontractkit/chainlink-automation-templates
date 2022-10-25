import { useState } from 'react'
import { useContractFunction, useEthers } from '@usedapp/core'
import { BigNumber, Contract } from 'ethers'
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
import { Error } from '../Error'
import { useCollectionCall } from '../../hooks/useCollectionCall'

/**
 * Prop Types
 */
interface MintProps {
  collection: Contract
}

/**
 * Component
 */
export const Mint = ({ collection }: MintProps): JSX.Element => {
  const { account } = useEthers()

  const [mintAmount, setMintAmount] = useState(1)
  const [isMintDisabled, setIsMintDisabled] = useState(false)

  const name = useCollectionCall<string>(collection, 'name')
  const symbol = useCollectionCall<string>(collection, 'symbol')
  const totalSupply = useCollectionCall<BigNumber>(collection, 'totalSupply')
  const mintCost = useCollectionCall<BigNumber>(collection, 'mintCost')
  const maxSupply = useCollectionCall<BigNumber>(collection, 'maxSupply')

  const hasReachedMaxSupply =
    totalSupply && maxSupply && totalSupply.gte(maxSupply)

  const { send, state } = useContractFunction(collection, 'mint')
  const isLoading = state.status === 'Mining'

  return (
    <Container centerContent>
      {state.errorMessage && <Error message={state.errorMessage} />}
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
          <NumberInputField bg="white" />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Button
          isLoading={isLoading}
          colorScheme="teal"
          disabled={
            isMintDisabled ||
            !account ||
            hasReachedMaxSupply ||
            isLoading ||
            !mintCost
          }
          marginLeft="4"
          onClick={() => {
            send(mintAmount, {
              value: mintCost.mul(mintAmount),
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
    </Container>
  )
}
