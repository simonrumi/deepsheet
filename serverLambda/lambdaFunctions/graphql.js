const { createServer, withAuth } = require('./helpers/graphqlHelpers');
const { log } = require('./helpers/logger');
const { LOG } = require('../constants');

// see https://www.apollographql.com/docs/apollo-server/migration/#apollo-server-lambda
const handler = async (event, context) => {
	log({ level: LOG.DEBUG }, 'graphql--handler got event', event, 'context', context);
   log({ level: LOG.SILLY }, 'lambda ENVIRONMENT VARIABLES\n' + JSON.stringify(process.env, null, 2));

   const server = await createServer();
   const graphqlHandler = server.createHandler();
	try {
		return await graphqlHandler(event, context);
	} catch (err) {
		log({ level: LOG.ERROR }, 'graphql--handler got error calling the graphqlHandler', err);
	}
}

// TODO - in theory we shouldn't need this old version - swap it for handler fn in the export statemetn below
const handler_forApolloServer2_x_x = async (event, context, callback) => {
	log({ level: LOG.DEBUG }, 'graphql.handler got event', event, 'context', context);
   log({ level: LOG.SILLY }, 'lambda ENVIRONMENT VARIABLES\n' + JSON.stringify(process.env, null, 2));

   const server = await createServer();

   const graphqlHandler = server.createHandler();
   return new Promise((yay, nay) => {
      const callbackFn = (err, args) => (err ? nay(err) : yay(args));
      graphqlHandler(event, context, callbackFn);
   });

   /* 
   Notes: if you just do this:
   return graphqlHandler(event, context, callback);

   ...it will throw an error saying
   "Cannot read property 'statusCode' of undefined"
   This is because using the callback and async-await is conflicting...see
   https://github.com/netlify/netlify-dev-plugin/issues/160

   ...trying this:
   return new Promise(graphqlHandler(event, context, callback));

   uses the new Promise to deal with the callback-async conflict, but just uses the given callback as-is
   ...however this causes the middleware onError to get an error saying
   "Promise resolver undefined is not a function"

   got this version from somewhere....it solves the problem
   yay ~= resolve
   nay ~= reject
   so it is creating a callback that will resolve with args or reject with the error:
   return new Promise((yay, nay) => {
      const callbackFn = (err, args) => (err ? nay(err) : yay(args));
      server.createHandler()(event, context, callbackFn);
   });
   */
};

module.exports = {
   handler: async (event, context) => await withAuth(handler_forApolloServer2_x_x)(event, context),
};
