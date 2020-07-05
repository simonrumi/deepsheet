const { GraphQLObjectType, GraphQLList } = require('graphql');
const SheetCellType = require('./sheet_cell_type');

const UpdateCellsPayload = new GraphQLObjectType({
   name: 'UpdateCellsPayload',
   description: 'Cell type definition',
   fields: () => ({
      cells: { type: new GraphQLList(SheetCellType) },
   }),
});

module.exports = UpdateCellsPayload;
