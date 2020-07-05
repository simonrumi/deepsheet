const graphql = require('graphql');
const { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLID } = graphql;
const mongoose = require('mongoose');
const SheetModel = mongoose.model('sheet');
const SheetType = require('./types/sheet_type');
const AddCellInput = require('./types/add_cell_input');
const UpdateCellsInput = require('./types/update_cells_input');
const UpdateCellsPayload = require('./types/update_cells_payload');
const { updateCells } = require('./helpers/updateCellsHelpers');

const RootMutationType = new GraphQLObjectType({
   name: 'RootMutation',
   fields: {
      changeTitle: {
         type: SheetType,
         args: {
            id: { type: GraphQLID },
            title: { type: GraphQLString },
         },
         resolve(parentValue, args, context) {
            console.log('RootMutation.changeTitle got args', args);
            return SheetModel.updateTitle(args.id, args.title);
         },
      },

      addCell: {
         type: UpdateCellsPayload,
         args: {
            input: {
               type: new GraphQLNonNull(AddCellInput),
            },
         },
         resolve: async (parentValue, args, context) => {
            const { id, row, column, text, subsheetId, visible } = args.input;
            const sheetDoc = await SheetModel.findById(id);
            const newCell = { row, column, content: { text: text || null, subsheetId: subsheetId || null }, visible };
            sheetDoc.cells.push(newCell);
            return await sheetDoc.save();
         },
      },

      updateCells: {
         type: UpdateCellsPayload,
         args: {
            input: {
               type: new GraphQLNonNull(UpdateCellsInput),
            },
         },
         resolve: async (parentValue, args, context) => {
            const { id, cells } = args.input;
            const sheetDoc = await SheetModel.findById(id);
            const updatedCells = updateCells(sheetDoc.cells, cells);
            sheetDoc.cells = updatedCells;
            return await sheetDoc.save();
         },
      },
   },
});

module.exports = RootMutationType;
