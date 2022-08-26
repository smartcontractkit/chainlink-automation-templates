import React from 'react'
import { Box, Heading } from '@chakra-ui/react'
import { Success } from '../components/success'
import { Section, Layout } from '../components/layout'

function SuccessPage(): JSX.Element {
  return (
    <>
      <Box maxWidth="container.md" p="8" mt="8" bg="gray.100">
        <Success />
      </Box>
    </>
  )
}

export default SuccessPage
