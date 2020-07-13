const graphql = require('graphql');
const R = require('ramda');
const { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLID } = graphql;
const mongoose = require('mongoose');
const SheetModel = mongoose.model('sheet');
const SheetType = require('./types/sheet_type');
const UpdateMetadataInput = require('./types/update_metadata_input');
const UpdateMetadataPayload = require('./types/update_metadata_payload');
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
            return SheetModel.updateTitle(args.id, args.title);
         },
      },

      updateMetadata: {
         type: UpdateMetadataPayload,
         args: {
            input: {
               type: new GraphQLNonNull(UpdateMetadataInput),
            },
         },
         resolve: async (parentValue, args, context) => {
            const sheetDoc = await SheetModel.findById(args.input.id);
            const newMetadata = R.mergeAll([
               sheetDoc.toObject().metadata, //toObject() gets rid of any weird props included from mongoose
               R.pick(
                  [
                     'totalRows',
                     'totalColumns',
                     'parentSheetId',
                     'summaryCell',
                     'columnVisibility',
                     'rowVisibility',
                     'columnFilters',
                     'rowFilters',
                  ],
                  args.input
               ),
            ]);
            sheetDoc.metadata = newMetadata;
            const result = await sheetDoc.save();
            return result;
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
            console.log('mutations.updateCells got args.input', args.input);
            const { id, cells } = args.input;
            const sheetDoc = await SheetModel.findById(id);
            console.log('mutations.updateCells got sheetDoc', sheetDoc);
            const updatedCells = updateCells(sheetDoc.cells, cells);
            sheetDoc.cells = updatedCells;
            console.log('mutations.updateCells udpated SheetDoc to look like this now', sheetDoc);
            return await sheetDoc.save();
         },
      },

      // addCells: {
      //    type: UpdateCellsPayload,
      //    args: {
      //       input: {
      //          type: new GraphQLNonNull(UpdateCellsInput),
      //       },
      //    },
      //    resolve: async (parentValue, args, context) => {
      //       const { id, cells } = args.input;
      //       const sheetDoc = await SheetModel.findById(id);
      //       console.log('mutations.addCells got args.input.cells', cells, 'and sheetDoc.cells', sheetDoc.cells);
      //       sheetDoc.cells = R.concat(sheetDoc.cells, cells);
      //       return await sheetDoc.save();
      //    },
      // },
   },
});

module.exports = RootMutationType;
