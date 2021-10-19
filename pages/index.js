import {useState} from 'react'
import { ResourcePicker, TitleBar } from '@shopify/app-bridge-react'
import { EmptyState, Page, Layout } from '@shopify/polaris'
import store from 'store-js';

import ResourceListWithProducts from '../queries/resourceList';

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

export default function Home() {
  const [open, setOpen] = useState(false)
  
  const handleSelection = (resources) => {
    const idsFromResources = resources.selection.map((product) => product.id)
    setOpen(false)
    store.set('ids', idsFromResources);
    console.log(idsFromResources)
  };

  return (
    <Page>
      <TitleBar
        title="Sample App"
        primaryAction={{
          content: 'Select products',
          onAction: () => setOpen(true)
        }}
      />
      <ResourcePicker
        resourceType="Product"
        showVariants={false}
        open={open}
        onSelection={(resources) => handleSelection(resources)}
        onCancel={() => setOpen(false)}
      />
      <Layout>
        <main className='main'>
          <EmptyState
            heading="Discount your products temporarily"
            action={{
              content: 'Select products',
              onAction: () => setOpen(!open),
            }}
            image={img}
          >
            <p>Select products to change their price temporarily.</p>
          </EmptyState>
        </main>
      </Layout>
      <ResourceListWithProducts />
    </Page>
  )
}
