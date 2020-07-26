const { GraphQLObjectType } = require('graphql');
const SheetCellType = require('./sheet_cell_type');

const UpdateCellPayload = new GraphQLObjectType({
   name: 'UpdateCellPayload',
   description: 'the mutation return value for a single Cell in a sheet',
   fields: () => ({
      cell: { type: SheetCellType },
   }),
});

module.exports = UpdateCellPayload;
