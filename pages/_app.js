import React from 'react';
import Head from 'next/head';
import App from 'next/app';

import '@shopify/polaris/dist/styles.css';
import { AppProvider } from '@shopify/polaris';
import { Provider, Context } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import translations from '@shopify/polaris/locales/en.json';

import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo';

import ClientRouter from '../components/clientRouter';

class MyProvider extends React.Component {
  static contextType = Context

  render() {
    const app = this.context

    const client = new ApolloClient({
      fetch: authenticatedFetch(app),
      fetchOptions: {
        credentials: 'include'
      }
    })
    return (
      <ApolloProvider client={client}>
        {this.props.children}
      </ApolloProvider>
    )
  }
}

class MyApp extends App {
  render() {
    const { Component, pageProps, shopOrigin } = this.props;

    const config = {
      apiKey: API_KEY,
      shopOrigin,
      forceRedirect: true
    };

    return (
      <>
        <Head>
          <title>Sample App</title>
          <meta charSet="utf-8" />
        </Head>
        {/* App bridge provider */}
        <Provider config={config}>
          {/* clientRouter to override the bridge router with next rout */}
          <ClientRouter />
          <AppProvider i18n={translations}>
            <MyProvider>
              <Component {...pageProps} />
            </MyProvider>
          </AppProvider>
        </Provider>
      </>
    );
  }
}

MyApp.getInitialProps = async ({ ctx }) => {
  return {
    shopOrigin: ctx.query.shop,
  }
}

export default MyApp
