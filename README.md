This is a Shopify embedded React/Next.js app that utilizes a node Koa server to authenticate users.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```
## 0- Env vars & Dependencies

#### Env variables

```
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_API_SCOPES=
SHOPIFY_APP_URL=
```

####  Dependencies 

```
dotenv
isomorphic-fetch
koa
koa-session
koa-router
shopify/koa-shopify-auth
shopify/app-bridge-utils
shopify/shopify-api
ngrok
graphql
apollo-boost
react-apollo
store-js
```

## 1- Create Node server 

* First up we bring isomorphic-fetch
```bash
require('isomorphic-fetch');
```
* Configure env using dotenv
```bash
const dotenv = require('dotenv');
# Load .env into node process and return an object
dotenv.config();
# Distructure env vars
const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env;
```
* Create Next custom app, it's requesets handler
```bash
# In server.js

const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;

const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });

const handle = app.getRequestHandler();
```
*  Add app routing middleware using Koa server
```bash
const Koa = require('koa');

# createShopifyAuth & verifyRequest middlewares for auth
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const { default: Shopify, ApiVersion } = require('@shopify/shopify-api');
const Router = require('koa-router');

# A session for securing user data
const session = require('koa-session');

app.prepare().then(() => {
    # Instantiate Koa server
    const server = new Koa();

    # Use a session on this server
    server.use(session({ secure: true, sameSite: 'none' }, server));

    # Pass secrets 
    server.keys = [SHOPIFY_API_SECRET_KEY];

    # Use createShopifyAuth middleware to 
    # trigger the authentication
    server.use(
        createShopifyAuth({
            apiKey: SHOPIFY_API_KEY,
            secret: SHOPIFY_API_SECRET_KEY,
            scopes: ['read_products'],
            afterAuth(ctx) {
                const { shop, accessToken } = ctx.session;
                ctx.redirect('/');
            },
        }),
    );

    # Use verifyRequest to redirect unauthenticated users to the OAuth route.
    server.use(verifyRequest());

    # Use the server handler middleware
    server.use(async (ctx) => {
        await handle(ctx.req, ctx.res);
        ctx.respond = false;
        ctx.res.statusCode = 200;
        return
    });

    # Set an app port
    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
});
```

## 2- Set up GraphQl

* Add GraphQL proxy
```bash
const Router = require('koa-router');

router.post("/graphql", verifyRequest(), async (ctx, next) => {
    await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
});
```
* Create Apollo provider that authenticate the ongoing requsets from client to /graphql
```bash
# In _app.js 

import { Provider, Context } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

class MyProvider extends React.Component {
  static contextType = Context;

  render() {
    const app = this.context;

    const client = new ApolloClient({
      fetch: authenticatedFetch(app),
      fetchOptions: {
        credentials: "include",
      },
    });

    return (
      <ApolloProvider client={client}>
        {this.props.children}
      </ApolloProvider>
    );
  }
}
# Then we wrapp our page with it 
<MyProvider>
    <Component {...pageProps} />
</MyProvider>

# Visit queries/resourceList.js to see an example of creating a gql query

```
<!-- ## 3- Set up polaris  -->

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
