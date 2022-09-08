import { useState } from 'react'
import { useEthers } from '@usedapp/core'
import { BigNumber } from 'ethers'
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
import { useCollectionFunction } from '../../hooks/useCollectionFunction'

/**
 * Prop Types
 */
interface MintProps {
  contractAddress: string
}

/**
 * Component
 */
export const Mint = ({ contractAddress }: MintProps): JSX.Element => {
  const { account } = useEthers()

  const [mintAmount, setMintAmount] = useState(1)
  const [isMintDisabled, setIsMintDisabled] = useState(false)

  const name = useCollectionCall<string>(contractAddress, 'name')
  const symbol = useCollectionCall<string>(contractAddress, 'symbol')
  const totalSupply = useCollectionCall<BigNumber>(
    contractAddress,
    'totalSupply'
  )
  const mintCost = useCollectionCall<BigNumber>(contractAddress, 'mintCost')
  const maxSupply = useCollectionCall<BigNumber>(contractAddress, 'maxSupply')

  const hasReachedMaxSupply =
    totalSupply && maxSupply && totalSupply.gte(maxSupply)

  const { send, state } = useCollectionFunction(contractAddress, 'mint')
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
            isMintDisabled || !account || hasReachedMaxSupply || isLoading
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
