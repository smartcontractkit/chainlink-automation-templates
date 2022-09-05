export function getErrorMessage(error: Error): string {
  if (error.message.includes("No injected provider available") ) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
  } else if (error.name === "ChainIdError") {
    return "You're connected to an unsupported network. Please switch to Goerli or Rinkeby."
  } else if (
    error.message.includes("The user rejected the request") ||
    error.message.includes("User rejected the request")
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
