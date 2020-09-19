const { gql } = require('apollo-server-lambda');

/// NOTE: removed
// express serverless-http body-parser
//  from serverLambda/package.json
// but did not uninstall them!!! ....so try installing from scratch to see what happens

const UserMutations = gql`
   input AccessInput {
      token: String
      tokenProvider: String
      userIdFromProvider: String
      tokenType: String
      tokenExpires: Int
   }

   input NewUserInput {
      firstName: String
      lastName: String
      email: String
      sheets: [ID]
      access: AccessInput
   }

   input UserSessionInput {
      userId: ID
      email: String
      userIdFromProvider: String
   }

   extend type Mutation {
      createUser(input: NewUserInput): UserType
      createUserSession(input: UserSessionInput): SessionType
      refreshUserSession(sessionId: ID!): SessionType
   }
`;

module.exports = UserMutations;
