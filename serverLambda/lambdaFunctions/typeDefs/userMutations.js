const { gql } = require('apollo-server-lambda');

/// NOTE: removed
// express serverless-http body-parser
//  from serverLambda/package.json
// but did not uninstall them!!! ....so try installing from scratch to see what happens

const UserMutations = gql`
   extend type Mutation {
      # TODO: what identifier do we need to supply when logging in?
      login: UserType

      # note that we're returning a Boolean when logging out, since there's nothing really to return, but we need to return something
      logout: Boolean
   }
`;

module.exports = UserMutations;
