const graphql = require('graphql');
const {
   GraphQLObjectType,
   GraphQLInt,
   GraphQLString,
   GraphQLBoolean,
   GraphQLNonNull,
} = graphql;
const SheetContentType = require('./sheet_content_type');

const SheetCellType = new GraphQLObjectType({
   name: 'SheetCellType',
   fields: {
      row: { type: new GraphQLNonNull(GraphQLInt) },
      column: { type: new GraphQLNonNull(GraphQLInt) },
      content: { type: new GraphQLNonNull(SheetContentType) },
      visible: { type: new GraphQLNonNull(GraphQLBoolean) },
   },
});

module.exports = SheetCellType;
