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

export function Load(): JSX.Element {
  const { account } = useEthers()

  const [hasError, setHasError] = useState(false)

  const [address, setAddress] = useState('')

  const [addressEntered, setAddressEntered] = useState(false)

  const viewCollection = async () => {
    // TODO: call function
    console.log(`Send address: ${address}`)
  }

  const isNotAddress = (value: string) => {
    return !/^0x[a-fA-F0-9]{40}$/.test(value);
  }

  const isInvalidAddress = isNotAddress(address)

return (
    <Container maxW="mt" centerContent>
    {hasError && <Error message="Error. TODO: real error here." />}
    <FormControl mt="4" isInvalid={addressEntered && isInvalidAddress}>
        <FormLabel htmlFor="url">Address</FormLabel>
        <Input
          value={address}
          id="tokenName"
          bgColor="white"
          onChange={(event) => setAddress(event.target.value)}
          onKeyUp={() => setAddressEntered(true)}
          onPaste={() => setAddressEntered(true)}
        />
        {isInvalidAddress && (
          <FormErrorMessage>Address is not valid.</FormErrorMessage>
        )}
      </FormControl>

    <Button
        mt="4"
        onClick={viewCollection}
        colorScheme="teal"
        disabled={isInvalidAddress || !account}
    >
        View Collection
    </Button>
    </Container>
)
}
