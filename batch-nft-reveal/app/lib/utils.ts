import { DEFAULT_SUPPORTED_CHAINS } from '@usedapp/core'

export function getErrorMessage(error: Error): string {
  if (error.message.includes('No injected provider available')) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
  } else if (error.name === 'ChainIdError') {
    return "You're connected to an unsupported network. Please switch to Goerli or Sepolia."
  } else if (
    error.message.includes('The user rejected the request') ||
    error.message.includes('User rejected the request')
  ) {
    return 'Please authorize this website to access your Ethereum account.'
  } else {
    console.error(error)
    return 'An unknown error occurred. Check the console for more details.'
  }
}

export function getContractError(msg: string): string {
  if (msg.includes('The execution failed due to an exception.')) {
    return `${msg} Please check if the contract has enough LINK to pay the oracle.`
  } else {
    return msg
  }
}

export function decodeBase64ToImageSrc(tokenUri: string): string {
  return JSON.parse(atob(tokenUri.split(',')[1])).image
}

export function getNetworkName(chainId: number) {
  return DEFAULT_SUPPORTED_CHAINS.find((network) => network.chainId === chainId)
    ?.chainName
}
