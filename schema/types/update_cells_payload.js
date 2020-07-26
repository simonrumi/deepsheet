const { GraphQLObjectType, GraphQLList } = require('graphql');
const SheetCellType = require('./sheet_cell_type');

const UpdateCellsPayload = new GraphQLObjectType({
   name: 'UpdateCellsPayload',
   description: 'the mutation return value for all Cells in a sheet',
   fields: () => ({
      cells: { type: new GraphQLList(SheetCellType) },
   }),
});

module.exports = UpdateCellsPayload;
