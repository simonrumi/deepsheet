// const { gql } = require('apollo-server-lambda');TIDY

const SessionType = `#graphql
   type SessionType {
      id: ID!
      lastAccessed: String
   }

   extend type Query {
      session(id: ID!): SessionType
   }
`;

export default SessionType;
