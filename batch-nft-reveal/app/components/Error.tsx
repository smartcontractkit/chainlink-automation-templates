import React from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  AlertProps
} from '@chakra-ui/react'

/**
 * Prop Types
 */
interface ErrorProps {
  message: string
}

/**
 * Component
 */
export function Error({ message, ...rest }: ErrorProps & AlertProps): JSX.Element {
  return (
    <Alert {...rest} status="error" mb="8">
      <AlertIcon />
      <AlertTitle mr={2}>Error:</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
