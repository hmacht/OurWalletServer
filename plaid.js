'use strict';

// read env vars from .env file
require('dotenv').config();

const { Configuration, PlaidApi, Products, PlaidEnvironments, CraCheckReportProduct } = require('plaid');

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || Products.Transactions).split(
  ',',
);

// PLAID_COUNTRY_CODES is a comma-separated list of countries for which users
// will be able to select institutions from.
const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US').split(
  ',',
);

// Parameters used for the OAuth redirect Link flow.
//
// The OAuth redirect flow requires an endpoint on the developer's website
// that the bank website should redirect to. You will need to configure
// this redirect URI for your client ID through the Plaid developer dashboard
// at https://dashboard.plaid.com/team/api.
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || '';

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});

const client = new PlaidApi(configuration);

const plaid = {
  // Function to create a Link Token
  createLinkToken: async (request, response, next) => {
      try {
        const { user_id } = request.query;
        
        if (!user_id) {
          return response.status(400).json({ error: "missing user_id" });
        }

        const configs = {
            user: {
                client_user_id: user_id,
            },
            client_name: 'OurWallet',
            products: PLAID_PRODUCTS,
            country_codes: PLAID_COUNTRY_CODES,
            language: 'en',
        };

          if (PLAID_REDIRECT_URI) {
              configs.redirect_uri = PLAID_REDIRECT_URI;
          }

          const createTokenResponse = await client.linkTokenCreate(configs);
          response.json(createTokenResponse.data);
      } catch (error) {
          next(error);
      }
  },

  // Function to exchange a public token for an access token
  exchangeToken: async (request, response, next) => {
      try {
          const { public_token } = request.query;

          console.log(public_token)
          
          if (!public_token) {
            return response.status(400).json({ error: "missing public_token" });
          }

          const tokenResponse = await client.itemPublicTokenExchange({
              public_token: public_token,
          });
          
          response.json({
              access_token: tokenResponse.data.access_token,
              item_id: tokenResponse.data.item_id,
              error: null,
          });
      } catch (error) {
          next(error);
      }
  },

  // Function to get last 30 days of transactions
  getTransactions: async (request, response, next) => {
    try {
      var { access_token } = request.query;
      
      if (!access_token) {
        return response.status(400).json({ error: "missing access_token" });
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 35);

      const formatDate = (date) => {
          return date.toISOString().split('T')[0];
      };

      const plaidResponse = await client.transactionsGet({
        access_token: access_token,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate)
      })
      
      const data = plaidResponse.data;

      response.json({ latest_transactions: data.transactions });
    } catch (error) {
        console.log(error)
        next(error);
    }
}
};

module.exports = plaid;
