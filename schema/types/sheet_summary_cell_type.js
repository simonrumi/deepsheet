const graphql = require('graphql');
const { GraphQLObjectType, GraphQLInt, GraphQLNonNull } = graphql;

const SheetSummaryCellType = new GraphQLObjectType({
   name: 'SheetSummaryCellType',
   fields: {
      row: { type: GraphQLNonNull(GraphQLInt) },
      column: { type: GraphQLNonNull(GraphQLInt) },
   },
});

module.exports = SheetSummaryCellType;
