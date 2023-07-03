// const { gql } = require('apollo-server-lambda');// old version TIDY

// const Root = gql` // old version TIDY
const Root = `#graphql
   type Query {
      root: String
   }

   type Mutation {
      root: String
   }
`;

export default Root;
