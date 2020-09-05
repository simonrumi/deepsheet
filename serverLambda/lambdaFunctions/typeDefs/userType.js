const { gql } = require('apollo-server-lambda');

const UserType = gql`
   type UserType {
      id: ID!
      name: String
   }

   extend type Query {
      user(id: ID!): UserType
      users: [UserType]
   }
`;

module.exports = UserType;
