const { gql } = require('apollo-server-lambda');

const UserType = gql`
   type AccessType {
      token: String
      tokenProvider: String
      userIdFromProvider: String
      tokenType: String
      tokenExpires: Int
   }

   type UserType {
      id: ID!
      firstName: String
      lastName: String
      email: String
      sheets: [ID]
      access: AccessType
      sessionId: ID
   }

   extend type Query {
      user(userId: ID!): UserType
      users: [UserType]
   }
`;

module.exports = UserType;
