const { ApolloServer, gql } = require('apollo-server-lambda');

const typeDefs = gql`
   type Hello {
      hello: String
   }

   type Query {
      hello: Hello
   }
`;

const resolvers = {
   Query: {
      hello: () => 'hello world from apollo-server-lambda',
   },
};

const server = new ApolloServer({ typeDefs, resolvers });

exports.graphqlHandler = server.createHandler();
