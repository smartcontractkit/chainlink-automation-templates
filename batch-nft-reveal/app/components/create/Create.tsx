import {
  Button,
  Container,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Tooltip,
} from '@chakra-ui/react'
import { useEthers } from '@usedapp/core'
import { useState } from 'react'
import { Error } from '../../components/Error'

export function Create(): JSX.Element {
  const { account } = useEthers()

  const [hasError, setHasError] = useState(false)

  const [tokenName, setTokenName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [maxSupply, setMaxSupply] = useState('')
  const [mintCost, setMintCost] = useState('')
  const [revealBatchSize, setRevealBatchSize] = useState('')
  const [revealInterval, setRevealInterval] = useState('')
  const [vrfSubscriptionId, setVrfSubscriptionId] = useState('')

  const [tokenNameEntered, setTokenNameEntered] = useState(false)
  const [symbolEntered, setSymbolEntered] = useState(false)
  const [maxSupplyEntered, setMaxSupplyEntered] = useState(false)
  const [mintCostEntered, setMintCostEntered] = useState(false)
  const [revealBatchSizeEntered, setRevealBatchSizeEntered] = useState(false)
  const [revealIntervalEntered, setRevealIntervalEntered] = useState(false)
  const [vrfSubscriptionIdEntered, setVrfSubscriptionIdEntered] =
    useState(false)

  const sendRequest = async () => {
    // TODO: call function for deploy contract here
    console.log(`Send create request with params: ${tokenName}, ${symbol}, ${maxSupply}, ${mintCost}, ${revealBatchSize},
    ${revealInterval}, ${vrfSubscriptionId}`)
  }

  const isNotNumber = (value: string) => {
    return !value || !/^[0-9]*$/.test(value)
  }

  const isNotFractualNumber = (value: string) => {
    return !value || !/^(0|([1-9][0-9]*))(\.[0-9]{0,18})?$/.test(value)
  }

  const isInvalidName = !tokenName
  const isInvalidSymbol = !symbol
  const isInvalidMaxSupply = isNotNumber(maxSupply) || Number(maxSupply) <= 0
  const isInvalidMintCost = isNotFractualNumber(mintCost)
  const isInvalidRevealBatchSize = isNotNumber(revealBatchSize)
  const isInvalidRevealInterval = isNotNumber(revealInterval)
  const isInvalidVrfSubscriptionId = isNotNumber(vrfSubscriptionId)

  const isInvalid =
    isInvalidName ||
    isInvalidSymbol ||
    isInvalidMaxSupply ||
    isInvalidMintCost ||
    isInvalidRevealBatchSize ||
    isInvalidRevealInterval ||
    isInvalidVrfSubscriptionId

  return (
    <Container maxW="mt" centerContent>
      {hasError && <Error message="Error. TODO: real error here." />}
      <FormControl mt="4" isInvalid={tokenNameEntered && isInvalidName}>
        <FormLabel htmlFor="url">Name</FormLabel>
        <Input
          value={tokenName}
          id="tokenName"
          bgColor="white"
          onChange={(event) => setTokenName(event.target.value)}
          onKeyUp={() => setTokenNameEntered(true)}
          onPaste={() => setTokenNameEntered(true)}
        />
        {isInvalidName && (
          <FormErrorMessage>Name is not valid.</FormErrorMessage>
        )}
      </FormControl>

      <FormControl mt="4" isInvalid={symbolEntered && isInvalidSymbol}>
        <FormLabel htmlFor="url">Symbol</FormLabel>
        <Input
          value={symbol}
          id="symbol"
          bgColor="white"
          onChange={(event) => setSymbol(event.target.value)}
          onKeyUp={() => setSymbolEntered(true)}
          onPaste={() => setSymbolEntered(true)}
        />
        {isInvalidSymbol && (
          <FormErrorMessage>Symbol is not valid.</FormErrorMessage>
        )}
      </FormControl>

      <FormControl mt="4" isInvalid={maxSupplyEntered && isInvalidMaxSupply}>
        <FormLabel htmlFor="path">Max supply</FormLabel>
        <Input
          value={maxSupply}
          id="maxSupply"
          bgColor="white"
          onChange={(event) => setMaxSupply(event.target.value)}
          onKeyUp={() => setMaxSupplyEntered(true)}
          onPaste={() => setMaxSupplyEntered(true)}
        />
        {isInvalidMaxSupply && (
          <FormErrorMessage>Max supplay must be positive number.</FormErrorMessage>
        )}
      </FormControl>

      <FormControl mt="4" isInvalid={mintCostEntered && isInvalidMintCost}>
        <FormLabel htmlFor="path">Cost (ETH)</FormLabel>
        <Input
          value={mintCost}
          id="mintCost"
          bgColor="white"
          onChange={(event) => setMintCost(event.target.value)}
          onKeyUp={() => setMintCostEntered(true)}
          onPaste={() => setMintCostEntered(true)}
        />
        {isInvalidMintCost && (
          <FormErrorMessage>Cost(ETH) must be positive fractional number.</FormErrorMessage>
        )}
      </FormControl>

      <FormControl
        mt="4"
        isInvalid={vrfSubscriptionIdEntered && isInvalidVrfSubscriptionId}
      >
        <FormLabel htmlFor="path">VRF ID</FormLabel>
        <Tooltip
          label="Chainkink VRF subscription ID"
          placement="right-start"
          fontSize="xs"
          hasArrow
        >
          <Input
            value={vrfSubscriptionId}
            id="vrfSubscriptionId"
            bgColor="white"
            onChange={(event) => setVrfSubscriptionId(event.target.value)}
            onKeyUp={() => setVrfSubscriptionIdEntered(true)}
            onPaste={() => setVrfSubscriptionIdEntered(true)}
          />
        </Tooltip>
        {isInvalidVrfSubscriptionId && (
          <FormErrorMessage>VRF ID must be no negative number.</FormErrorMessage>
        )}
      </FormControl>

      <Divider
        id="create-divider"
        orientation="horizontal"
        margin="20px 20px 20px 20px"
      />
      <Tooltip
        label="If the following conditions are met, batch reveal will be fulfilled."
        placement="right-start"
        fontSize="xs"
        hasArrow
      >
        <p>Batch Reveal</p>
      </Tooltip>

      <FormControl
        mt="4"
        isInvalid={revealBatchSizeEntered && isInvalidRevealBatchSize}
      >
        <FormLabel htmlFor="path">Batch Size</FormLabel>

        <Input
          value={revealBatchSize}
          id="revealBatchSize"
          bgColor="white"
          onChange={(event) => setRevealBatchSize(event.target.value)}
          onKeyUp={() => setRevealBatchSizeEntered(true)}
          onPaste={() => setRevealBatchSizeEntered(true)}
        />
        {isInvalidRevealBatchSize && (
          <FormErrorMessage>Batch size must be positive number.</FormErrorMessage>
        )}
      </FormControl>

      <FormControl
        mt="4"
        isInvalid={revealIntervalEntered && isInvalidRevealInterval}
      >
        <FormLabel htmlFor="path">Interval (Seconds)</FormLabel>
        <Input
          value={revealInterval}
          id="revealInterval"
          bgColor="white"
          onChange={(event) => setRevealInterval(event.target.value)}
          onKeyUp={() => setRevealIntervalEntered(true)}
          onPaste={() => setRevealIntervalEntered(true)}
        />
        {isInvalidRevealInterval && (
          <FormErrorMessage>Reveal interval must be no negative number.</FormErrorMessage>
        )}
      </FormControl>

      <Button
        mt="4"
        onClick={sendRequest}
        colorScheme="teal"
        disabled={isInvalid || !account}
      >
        Deploy
      </Button>
    </Container>
  )
}
