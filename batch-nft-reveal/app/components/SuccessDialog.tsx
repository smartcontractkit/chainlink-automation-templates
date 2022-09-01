import React from 'react'
import { useRouter } from 'next/router'
import { DEFAULT_SUPPORTED_CHAINS, useEthers } from '@usedapp/core'
import {
  Button,
  HStack,
  Text,
  Link,
  useClipboard,
  Tooltip,
  Heading,
  Stack,
  Checkbox,
  Code,
} from '@chakra-ui/react'
import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons'

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
  const [checkedSteps, setCheckedSteps] = React.useState([false, false])
  const allChecked = checkedSteps.every(Boolean)

  const { hasCopied, onCopy } = useClipboard(contractAddress, 3000)

  const router = useRouter()

  const viewColleciton = () => {
    router.push(`/collection/${contractAddress}`)
  }

  const { chainId } = useEthers()

  const network = DEFAULT_SUPPORTED_CHAINS
      .find((network) => network.chainId === chainId)
      ?.chainName

  return (
    <>
      <Heading as="h2" mb="4" size="md">
        Sample NFT Collection successfully deployed!
      </Heading>
      <HStack>
        <Text>Address:</Text>
        <Code>{contractAddress}</Code>
        <Tooltip
          label={hasCopied ? 'Copied' : 'Copy to Clipboard'}
          placement="right-start"
          fontSize="xs"
          hasArrow
          closeOnClick={false}
        >
          <Link>
            <CopyIcon onClick={onCopy} mx="2px" />
          </Link>
        </Tooltip>
        <Tooltip
          label="Open in Explorer"
          placement="right-start"
          fontSize="xs"
          hasArrow
        >
          <Link
            href={`https://${
              network === 'mainnet' ? '' : `${network}.`
            }etherscan.io/tx/${deployTxHash}`}
            isExternal
          >
            <ExternalLinkIcon />
          </Link>
        </Tooltip>
      </HStack>
      <Heading as="h3" mt="8" size="sm">
        Next Steps
      </Heading>
      <Stack mt="4" spacing="4">
        <HStack>
          <Checkbox
            size="lg"
            background="white"
            isChecked={checkedSteps[0]}
            onChange={(e) =>
              setCheckedSteps([e.target.checked, checkedSteps[1]])
            }
          />
          <Text>1. Add contract as consumer to your VRF subscription</Text>
          <Link href="https://vrf.chain.link" isExternal>
            <ExternalLinkIcon />
          </Link>
        </HStack>
        <HStack>
          <Checkbox
            size="lg"
            background="white"
            isChecked={checkedSteps[1]}
            onChange={(e) =>
              setCheckedSteps([checkedSteps[0], e.target.checked])
            }
          />
          <Text>2. Register new Upkeep</Text>
          <Link href="https://keepers.chain.link" isExternal>
            <ExternalLinkIcon />
          </Link>
        </HStack>
      </Stack>
      <Button
        mt="8"
        colorScheme="teal"
        disabled={!allChecked}
        onClick={viewColleciton}
      >
        View Collection
      </Button>
    </>
  )
}
