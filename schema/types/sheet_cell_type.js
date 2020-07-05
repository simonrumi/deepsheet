const graphql = require('graphql');
const { GraphQLObjectType, GraphQLInt, GraphQLBoolean, GraphQLNonNull } = graphql;
const CellContentType = require('./cell_content_type');

const SheetCellType = new GraphQLObjectType({
   name: 'SheetCellType',
   fields: {
      row: { type: new GraphQLNonNull(GraphQLInt) },
      column: { type: new GraphQLNonNull(GraphQLInt) },
      content: { type: new GraphQLNonNull(CellContentType) },
      visible: { type: new GraphQLNonNull(GraphQLBoolean) },
   },
});

module.exports = SheetCellType;
