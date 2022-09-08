import React from 'react'
import { useRouter } from 'next/router'
import { Field, FormikProvider, useFormik } from 'formik'
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Tooltip,
} from '@chakra-ui/react'

/**
 * Constants & Helpers
 */
const validateAddress = (value: string): string => {
  let error: string
  if (!value) {
    error = 'Required'
  } else if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
    error = 'Invalid address'
  }
  return error
}

/**
 * Component
 */
export const OpenForm = (): JSX.Element => {
  const router = useRouter()

  const formik = useFormik({
    initialValues: {
      address: '',
    },
    onSubmit: (values) => {
      router.push(`/collection/${values.address}`)
    },
  })

  return (
    <form onSubmit={formik.handleSubmit}>
      <FormikProvider value={formik}>
        <FormControl
          isInvalid={formik.touched.address && !!formik.errors.address}
        >
          <FormLabel htmlFor="address">Address</FormLabel>
          <Tooltip
            label="Deployed NFT collection contract from this app"
            placement="right-start"
            fontSize="xs"
            hasArrow
          >
            <div>
              <Field
                as={Input}
                bg="white"
                name="address"
                validate={validateAddress}
              />
            </div>
          </Tooltip>
          {formik.errors.address && formik.touched.address && (
            <FormErrorMessage>{formik.errors.address}</FormErrorMessage>
          )}
        </FormControl>
        <Button
          mt="4"
          colorScheme="teal"
          type="submit"
          disabled={
            !formik.dirty ||
            Array.isArray(formik.errors) ||
            Object.values(formik.errors).toString() != ''
          }
        >
          Go to Collection
        </Button>
      </FormikProvider>
    </form>
  )
}
