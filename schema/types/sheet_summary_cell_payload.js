/**
 * made this because when running the updateMetadata mutation, the SheetSummaryCellType was causing an error
 * "Cannot return null for non-nullable field SheetSummaryCellType.row"
 * So this type allows rows and columns to be null, just for the siutation where we are returning info from an update.
 **/

const graphql = require('graphql');
const { GraphQLObjectType, GraphQLInt } = graphql;

const SheetSummaryCellPayload = new GraphQLObjectType({
   name: 'SheetSummaryCellPayload',
   fields: {
      row: { type: GraphQLInt },
      column: { type: GraphQLInt },
   },
});

module.exports = SheetSummaryCellPayload;
