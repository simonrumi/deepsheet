const graphql = require('graphql');
const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLList } = graphql;
const SheetMetadataType = require('./sheet_metadata_type');
const SheetCellType = require('./sheet_cell_type');

const SheetType = new GraphQLObjectType({
   name: 'SheetType',
   fields: {
      id: { type: GraphQLID },
      metadata: { type: SheetMetadataType },
      title: { type: GraphQLString },
      cells: { type: new GraphQLList(SheetCellType) },
   },
});

module.exports = SheetType;
