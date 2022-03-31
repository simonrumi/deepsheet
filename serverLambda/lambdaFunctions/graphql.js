const { createServer, withAuth } = require('./helpers/graphqlHelpers');
const { log } = require('./helpers/logger');
const { LOG } = require('../constants');

const handler = async (event, context) => {
	log({ level: LOG.DEBUG }, 'graphql--handler got event', event, 'context', context);
   log({ level: LOG.SILLY }, 'lambda ENVIRONMENT VARIABLES\n' + JSON.stringify(process.env, null, 2));

   const server = await createServer();
   const graphqlHandler = server.createHandler();

	// the following is to do with @vendia/serverless-express which is used by apollo-server-lambda 
	// in the function getEventSourceNameBasedOnEvent it is trying to get some info about the AWS setup, 
	// so needed to add this line when creating the ApolloServer
	// see my stack overflow entry here
	// https://stackoverflow.com/questions/71360059/apollo-server-lambda-unable-to-determine-event-source-based-on-event/71629935?noredirect=1#comment126606630_71629935
	if (!event.requestContext) {
		event.requestContext = context;
	}
	try {
		return await graphqlHandler(event, context);
	} catch (err) {
		log({ level: LOG.ERROR }, 'graphql--handler got error calling the graphqlHandler', err);
	}
}

module.exports = {
   handler: async (event, context) => await withAuth(handler)(event, context),
};
