import {
  Container,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react'
import { AddressProp } from '../../../types/AddressProp'
import { AllTokens } from './'
import { OwnedTokens } from './'

export const Gallery = (props: AddressProp): JSX.Element => {
  const { contractAddress } = props

  return (
    <Container mt={5} maxWidth="100%" textAlign="center">
      <Tabs>
        <TabList>
          <Tab _selected={{ color: 'white', bg: 'teal' }}>Owned</Tab>
          <Tab _selected={{ color: 'white', bg: 'teal' }}>All</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <OwnedTokens contractAddress={contractAddress}></OwnedTokens>
          </TabPanel>
          <TabPanel>
            <AllTokens contractAddress={contractAddress}></AllTokens>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  )
}
