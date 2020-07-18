const graphql = require('graphql');
const R = require('ramda');
const { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLID, GraphQLInt } = graphql;
const mongoose = require('mongoose');
const SheetModel = mongoose.model('sheet');
const SheetType = require('./types/sheet_type');
const UpdateMetadataInput = require('./types/update_metadata_input');
const UpdateMetadataPayload = require('./types/update_metadata_payload');
const UpdateCellsInput = require('./types/update_cells_input');
const UpdateCellsPayload = require('./types/update_cells_payload');
const { updateCells } = require('../helpers/updateCellsHelpers');
const { createEmptySheet } = require('../helpers/sheetHelpers');
const { DEFAULT_ROWS, DEFAULT_COLUMNS, DEFAULT_TITLE } = require('../constants');

const RootMutationType = new GraphQLObjectType({
   name: 'RootMutation',
   fields: {
      createSheet: {
         type: SheetType,
         args: {
            rows: { type: GraphQLInt },
            columns: { type: GraphQLInt },
            title: { type: GraphQLString },
         },
         resolve(parentValue, args, context) {
            const defaultSheet = createEmptySheet(
               args.rows || DEFAULT_ROWS,
               args.columns || DEFAULT_COLUMNS,
               args.title || DEFAULT_TITLE
            );
            return new SheetModel(defaultSheet).save();
         },
      },

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
