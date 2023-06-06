import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Text,
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
} from '@chakra-ui/react'
import { useEthers, useNotifications } from '@usedapp/core'
import blockies from 'blockies-ts'
import NextLink from 'next/link'
import TagManager from 'react-gtm-module'
import React, { useEffect } from 'react'
import { getErrorMessage } from '../../lib/utils'
import { Balance } from '../Balance'
import { ConnectWallet } from '../ConnectWallet'
import { Head, MetaProps } from './Head'
import { Error } from '../Error'

// Extends `window` to add `ethereum`.
declare global {
  interface Window {
    ethereum: any
  }
}

/**
 * Constants & Helpers
 */

// Title text for the various transaction notifications.
const TRANSACTION_TYPE_TITLES = {
  transactionStarted: 'Mint started',
  transactionSucceed: 'Mint completed',
}

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

// Takes a long hash string and truncates it.
function truncateHash(hash: string, length = 38): string {
  return hash.replace(hash.substring(6, length), '...')
}

/**
 * Prop Types
 */
interface LayoutProps {
  children: React.ReactNode
  customMeta?: MetaProps
}

/**
 * Component
 */
export const Layout = ({ children, customMeta }: LayoutProps): JSX.Element => {
  const { account, deactivate, error } = useEthers()
  const { notifications } = useNotifications()

  useEffect(() => {
    if (GTM_ID) {
      TagManager.initialize({ gtmId: GTM_ID })
    }
  }, [])

  let blockieImageSrc
  if (typeof window !== 'undefined') {
    blockieImageSrc = blockies.create({ seed: account }).toDataURL()
  }

  return (
    <>
      <Head customMeta={customMeta} />
      <Container as="header" maxWidth="container.xl">
        <SimpleGrid
          columns={[1, 1, 1, 2]}
          alignItems="center"
          justifyContent="space-between"
          py="8"
        >
          <Flex py={[4, null, null, 0]}>
            <NextLink href="/" passHref>
              <Link px="4" py="1">
                Home
              </Link>
            </NextLink>
            <NextLink href="/create" passHref>
              <Link px="4" py="1">
                Create
              </Link>
            </NextLink>
            <NextLink href="/open" passHref>
              <Link px="4" py="1">
                Open
              </Link>
            </NextLink>
          </Flex>
          {account ? (
            <Flex
              order={[-1, null, null, 2]}
              alignItems={'center'}
              justifyContent={['flex-start', null, null, 'flex-end']}
            >
              <Balance />
              <Image ml="4" src={blockieImageSrc} alt="blockie" />
              <Menu placement="bottom-end">
                <MenuButton as={Button} ml="4">
                  {truncateHash(account)}
                </MenuButton>
                <MenuList>
                  <MenuItem
                    onClick={() => {
                      deactivate()
                    }}
                  >
                    Disconnect
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          ) : (
            <ConnectWallet />
          )}
        </SimpleGrid>
      </Container>
      <Container as="main" maxWidth="container.xl">
        {error && <Error message={getErrorMessage(error)} />}
        {children}
        {notifications.map((notification) => {
          if (notification.type === 'walletConnected') {
            return null
          }
          return (
            <Alert
              key={notification.id}
              status="success"
              position="fixed"
              bottom="8"
              right="8"
              width="400px"
            >
              <AlertIcon />
              <Box>
                <AlertTitle>
                  {notification.transactionName}{' '}
                  {TRANSACTION_TYPE_TITLES[notification.type]}
                </AlertTitle>
                {'transaction' in notification && (
                  <AlertDescription overflow="hidden">
                    Transaction Hash:
                    {truncateHash(notification.transaction.hash, 61)}
                  </AlertDescription>
                )}
              </Box>
            </Alert>
          )
        })}
      </Container>
      <Container as="footer" mt="8" maxWidth="container.xl">
        <HStack>
          <Link href="https://chn.lk/3R7BPNw" isExternal>
            <Image
              src="https://chain.link/badge-automation-black"
              height="72px"
              alt="automation secured with chainlink"
            />
          </Link>
          <Link href="https://chn.lk/3C1ffBV" isExternal>
            <Image
              src="https://chain.link/badge-randomness-black"
              height="72px"
              alt="randomness secured with chainlink"
            />
          </Link>
        </HStack>
        <HStack py="8">
          <Link
            href="https://github.com/smartcontractkit/chainlink-automation-templates/tree/main/batch-nft-reveal"
            isExternal
          >
            <HStack>
              <Image src="../images/github.svg" width="20px" />
              <Text>GitHub</Text>
            </HStack>
          </Link>
        </HStack>
      </Container>
    </>
  )
}
