import { Spinner } from '@chakra-ui/react'

export const Loading = (): JSX.Element => (
  <Spinner
    thickness="4px"
    speed="0.65s"
    emptyColor="gray.200"
    color="teal"
    size="lg"
  />
)
