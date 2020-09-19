const { gql } = require('apollo-server-lambda');

const SessionType = gql`
   type SessionType {
      id: ID!
      lastAccessed: String
   }

   extend type Query {
      session(id: ID!): SessionType
   }
`;

module.exports = SessionType;
