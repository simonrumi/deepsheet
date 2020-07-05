const graphql = require('graphql');
const { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLInputObjectType } = graphql;
const SheetCellType = require('./sheet_cell_type');
const CellInput = require('./cell_input');

const UpdateCellsInput = new GraphQLInputObjectType({
   description: 'input fields for updating one or more existing cells in a sheet',
   name: 'UpdateCellsInput',
   fields: {
      id: { type: new GraphQLNonNull(GraphQLID) }, // id of the sheet
      cells: { type: new GraphQLList(CellInput) },
   },
});

module.exports = UpdateCellsInput;
