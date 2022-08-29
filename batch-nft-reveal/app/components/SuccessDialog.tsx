import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useEthers } from '@usedapp/core'
import {
  Button,
  HStack,
  Text,
  Link,
  useClipboard,
  Tooltip,
  Center,
  ButtonGroup,
  Heading,
} from '@chakra-ui/react'
import {
  CopyIcon,
  ExternalLinkIcon,
  QuestionOutlineIcon,
} from '@chakra-ui/icons'

/**
 * Prop Types
 */
interface SuccessDialogProps {
  contractAddress: string
  deployTxHash: string
}

/**
 * Component
 */
export const SuccessDialog = ({
  contractAddress,
  deployTxHash,
}: SuccessDialogProps): JSX.Element => {
  const { library } = useEthers()
  const router = useRouter()
  const [network, setNetwork] = useState('rinkeby')
  const { hasCopied, onCopy } = useClipboard(contractAddress, 3000)

  useEffect(() => {
    const setNetworkName = async () => {
      const name = (await library.getNetwork()).name
      setNetwork(name)
    }

    if (library) {
      setNetworkName()
    }
  }, [library, setNetwork])

  const viewColleciton = () => {
    router.push(`/collection/${contractAddress}`)
  }

  return (
    <>
      <Heading as="h1" mb="8" size="lg">
        Sample NFT Collection successfully deployed
      </Heading>
      <HStack>
        <Text fontSize="xl">Address:</Text>
        <Text fontSize="xl">{contractAddress}</Text>
        <Tooltip
          label={hasCopied ? 'Copied' : 'Copy to clipboard'}
          placement="right-start"
          fontSize="xs"
          hasArrow
          closeOnClick={false}
        >
          <Link>
            <CopyIcon onClick={onCopy} mx="2px" />
          </Link>
        </Tooltip>
      </HStack>
      <Center>
        <HStack>
          <Link
            href={`https://${
              network === 'mainnet' ? '' : `${network}.`
            }etherscan.io/tx/${deployTxHash}`}
            isExternal
          >
            Deploy Tx <ExternalLinkIcon mx="2px" />
          </Link>
        </HStack>
      </Center>
      <Center>
        <HStack spacing="10px">
          <Link
            _focus={{ boxShadow: 'none' }}
            href="https://docs.chain.link/docs/chainlink-keepers/register-upkeep/"
            isExternal
          >
            <QuestionOutlineIcon />
          </Link>
          <ButtonGroup gap="2">
            <Link
              style={{ textDecoration: 'none' }}
              _focus={{ boxShadow: 'none' }}
              href="https://keepers.chain.link/new"
              isExternal
            >
              <Button mt="4" colorScheme="teal">
                Register Upkeep
              </Button>
            </Link>
            <Button mt="4" colorScheme="teal" onClick={viewColleciton}>
              View Collection
            </Button>
          </ButtonGroup>
        </HStack>
      </Center>
    </>
  )
}
