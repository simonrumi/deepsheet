const { ApolloServer } = require('apollo-server-lambda');
const dbConnector = require('./dbConnector');
const typeDefs = require('../typeDefs');
const resolvers = require('../resolvers');

exports.handler = async function (event, context) {
   const db = await dbConnector();
   const server = new ApolloServer({ typeDefs, resolvers: resolvers(db) });
   return new Promise((yay, nay) => {
      const callbackFns = (err, args) => (err ? nay(err) : yay(args));
      server.createHandler()(event, context, callbackFns);
   });
};
