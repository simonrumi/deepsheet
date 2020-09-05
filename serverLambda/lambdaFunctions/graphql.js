const { ApolloServer } = require('apollo-server-lambda');
const dbConnector = require('./dbConnector');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

export async function handler(event, context) {
   // console.log('lambda ENVIRONMENT VARIABLES\n' + JSON.stringify(process.env, null, 2));
   const db = await dbConnector();
   const server = new ApolloServer({
      typeDefs,
      resolvers: resolvers(db),
      debug: true,
   });

   console.log('created apollo server');
   return new Promise((yay, nay) => {
      const callbackFns = (err, args) => (err ? nay(err) : yay(args));
      server.createHandler()(event, context, callbackFns);
   });
}
