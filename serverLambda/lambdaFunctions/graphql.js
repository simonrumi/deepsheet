import { createServer, withAuth } from './helpers/graphqlHelpers';
import { startServerAndCreateLambdaHandler, handlers } from '@as-integrations/aws-lambda';
import { log } from './helpers/logger';
import { LOG } from '../constants';

const handler = async (event, context) => {
	log({ level: LOG.VERBOSE }, 'graphql--handler started');
	log({ level: LOG.DEBUG }, 'graphql--handler got event', event, 'context', context);
   log({ level: LOG.SILLY }, 'lambda ENVIRONMENT VARIABLES\n' + JSON.stringify(process.env, null, 2));

   const server = await createServer();

	/* OLD VERSION ...hopefully TIDY all this away ***

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
	*/

	try {
		console.log('graphql.js--handler about to startServerAndCreateLambdaHandler');
		// see https://www.apollographql.com/docs/apollo-server/deployment/lambda/
		const graphqlHandler = startServerAndCreateLambdaHandler(
			server,
			handlers.createAPIGatewayProxyEventV2RequestHandler(),
		);
		console.log('graphql.js--handler created graphqlHandler', graphqlHandler);
		return await graphqlHandler(event, context);
	} catch (err) {
		log({ level: LOG.ERROR }, 'graphql--handler got error calling the graphqlHandler', err);
	}
}

const graphQLWithAuth = async (event, context) => await withAuth(handler)(event, context);

export default graphQLWithAuth;

/* module.exports = {
   handler: async (event, context) => await withAuth(handler)(event, context),
}; */ // TIDY
