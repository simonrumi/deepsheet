const graphql = require('graphql');
const { GraphQLObjectType, GraphQLInt, GraphQLList, GraphQLNonNull } = graphql;
const SheetCellType = require('./sheet_cell_type');

const SheetRowType = new GraphQLObjectType({
   name: 'SheetRowType',
   fields: {
      row: { type: new GraphQLNonNull(GraphQLInt) },
      columns: { type: new GraphQLList(SheetCellType) },
   },
});

module.exports = SheetRowType;
