import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Card } from '@shopify/polaris';
import store from 'store-js';

const GET_PRODUCTS_BY_ID = gql`
    query getProducts($id : [ID!]!) {
        nodes(ids: $ids){
            ... on Product {
                title 
                hadle 
                descriptionHtml
                id 
                images(first: 1){
                    edges {
                        node {
                            originalSrc 
                            altText
                        }
                    }
                }
                variants(first: 1) {
                    edges {
                        node {
                            price
                            id 
                        }
                    }
                }
            }
        }
    }
`

function ResourceListWithProducts() {
    return (
        <Query query={GET_PRODUCTS_BY_ID} variables={{ ids: store.get('ids') }}>
            {({ data, loading, error }) => {
                if (loading) return <div>Loading…</div>;
                if (error) return <div>{error.message}</div>;
                console.log('dats',data);
                return (
                    <Card>
                        <p>stuff here</p>
                    </Card>
                );
            }}
        </Query>
    );
}

export default ResourceListWithProducts;
