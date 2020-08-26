const { gql } = require('apollo-server-lambda');

const Root = gql`
   type Query {
      root: String
   }

   type Mutation {
      root: String
   }
`;

module.exports = Root;
