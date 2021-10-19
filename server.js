require('isomorphic-fetch');

const dotenv = require('dotenv');
const Koa = require('koa');
const next = require('next');

// We need createShopifyAuth & verifyRequest middlewares for auth
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const { default: Shopify, ApiVersion } = require('@shopify/shopify-api');

const session = require('koa-session');
const Router = require('koa-router');

dotenv.config();

const {
    SHOPIFY_API_SECRET,
    SHOPIFY_API_KEY,
    SHOPIFY_API_SCOPES,
    SHOPIFY_APP_URL,
    PORT
} = process.env;

Shopify.Context.initialize({
    API_KEY: SHOPIFY_API_KEY,
    API_SECRET_KEY: SHOPIFY_API_SECRET,
    SCOPES: SHOPIFY_API_SCOPES.split(","),
    HOST_NAME: SHOPIFY_APP_URL.replace(/https:\/\//, ""),
    API_VERSION: ApiVersion.October20,
    IS_EMBEDDED_APP: true,
    SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

const port = parseInt(PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const ACTIVE_SHOPIFY_SHOPS = {};

// ADD ROUTING MIDDLEWARE
app.prepare().then(() => {
    // Instantiate Koa server
    const server = new Koa();
    const router = new Router();

    server.keys = [Shopify.Context.API_SECRET_KEY];
    // Use a session on this server
    server.use(session({ secure: true, sameSite: 'none' }, server));

    // Pass secrets 
    server.keys = [SHOPIFY_API_SECRET];

    // Use createShopifyAuth middleware to 
    // trigger the authentication
    server.use(
        createShopifyAuth({
            apiKey: SHOPIFY_API_KEY,
            secret: SHOPIFY_API_SECRET,
            scopes: ['read_products'],
            afterAuth(ctx) {
                const urlParams = new URLSearchParams(ctx.request.url);
                const shop = urlParams.get('shop');

                ctx.redirect(`/?shop=${shop}`);
                // const { shop, accessToken } = ctx.session;
                // ctx.redirect('/');
            },
        }),
    );

    server.use(
        createShopifyAuth({
            afterAuth(ctx) {
                const { shop, scope } = ctx.state.shopify;
                ACTIVE_SHOPIFY_SHOPS[shop] = scope;

                ctx.redirect(`/`);
            },
        }),
    );

    // Use verifyRequest to redirect unauthenticated users to the OAuth route.
    server.use(verifyRequest());

    router.post("/graphql", verifyRequest(), async (ctx, next) => {
        await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
    });

    
    // Use the server handler middleware
    server.use(async (ctx) => {
        await handle(ctx.req, ctx.res);
        ctx.respond = false;
        ctx.res.statusCode = 200;
        return
    });

    // Set an app port
    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
});