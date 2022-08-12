import React from 'react'
import { useRouter } from 'next/router';
import { Field, FormikProvider, useFormik } from 'formik'
import {
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react'

export const Load = (): JSX.Element => {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      address: '',
    },
    onSubmit: (values) => {
      router.push(`/collection/${values.address}`);
      console.log(values)
    },
  })

  const validateAddress = (value: string): string => {
    let error: string
    if (!value) {
      error = 'Required'
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
      error = 'Invalid address'
    }
    return error
  }

  return (
    <form onSubmit={formik.handleSubmit}>
      <Container>
        <FormikProvider value={formik}>
          <FormControl
            mt="4"
            isInvalid={formik.touched.address && !!formik.errors.address}
          >
            <FormLabel htmlFor="address">Address</FormLabel>
            <Field
              as={Input}
              bg="white"
              name="address"
              validate={validateAddress}
            />
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
            Submit
          </Button>
        </FormikProvider>
      </Container>
    </form>
  )
}
