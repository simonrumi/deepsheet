const graphql = require('graphql');
const { GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLInt, GraphQLID } = graphql;

const UpdateSubsheetIdInput = new GraphQLInputObjectType({
   description: 'input fields for updating the subsheet id of a cell',
   name: 'UpdateSubsheetIdInput',
   fields: {
      sheetId: { type: GraphQLNonNull(GraphQLID) },
      row: { type: GraphQLNonNull(GraphQLInt) },
      column: { type: GraphQLNonNull(GraphQLInt) },
      subsheetId: { type: GraphQLID },
      text: { type: GraphQLString },
   },
});

module.exports = UpdateSubsheetIdInput;
