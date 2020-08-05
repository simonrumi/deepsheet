const graphql = require('graphql');
const { GraphQLNonNull, GraphQLInputObjectType, GraphQLInt } = graphql;

const SheetSummaryCellInput = new GraphQLInputObjectType({
   description: 'input fields for updating the summary cell',
   name: 'SheetSummaryCellInput',
   fields: {
      row: { type: new GraphQLNonNull(GraphQLInt) },
      column: { type: new GraphQLNonNull(GraphQLInt) },
   },
});

module.exports = SheetSummaryCellInput;
