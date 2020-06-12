const graphql = require('graphql');
const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLList } = graphql;
const SheetMetadataType = require('./sheet_metadata_type');
const SheetRowType = require('./sheet_row_type');

const SheetType = new GraphQLObjectType({
   name: 'SheetType',
   fields: {
      id: { type: GraphQLID },
      metadata: { type: SheetMetadataType },
      title: { type: GraphQLString },
      rows: { type: new GraphQLList(SheetRowType) },
   },
});

module.exports = SheetType;
