const graphql = require('graphql');
const { GraphQLID, GraphQLInt, GraphQLString, GraphQLBoolean, GraphQLNonNull, GraphQLInputObjectType } = graphql;

const AddCellInput = new GraphQLInputObjectType({
   description: 'input fields for adding a cell to a sheet',
   name: 'AddCellInput',
   fields: {
      id: { type: new GraphQLNonNull(GraphQLID) }, // id of the sheet
      row: { type: new GraphQLNonNull(GraphQLInt) },
      column: { type: new GraphQLNonNull(GraphQLInt) },
      visible: { type: new GraphQLNonNull(GraphQLBoolean) },
      subsheetId: { type: GraphQLID }, // part of the content subdoc
      text: { type: GraphQLString }, // part of the content subdoc
   },
});

module.exports = AddCellInput;
