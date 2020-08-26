const R = require('ramda');
const { isSomething } = require('../helpers');
const mongoose = require('mongoose');
require('../models/SheetModel');
const SheetModel = mongoose.model('sheet');
const { getAllSheets, createNewSheet } = require('../helpers/sheetHelpers');
const { updateCells, deleteSubsheetId, findCellByRowAndColumn } = require('../helpers/updateCellsHelpers');
const { DEFAULT_ROWS, DEFAULT_COLUMNS, DEFAULT_TITLE, DEFAULT_SUMMARY_CELL } = require('../constants');

module.exports = db => ({
   Query: {
      sheet: async (parent, args, context) => {
         try {
            return SheetModel.findById(args.sheetId);
         } catch (err) {
            console.log('Error finding sheet:', err);
            return err;
         }
      },

      sheets: async (parent, args, context) => {
         return await getAllSheets();
      },

      subsheetId: async (parent, args, context) => {
         console.log('subsheetId resolver, got parent', parent);
         if (parent.subsheetId) {
            try {
               const subsheet = await SheetModel.findById(parent.subsheetId);
               if (isSomething(subsheet)) {
                  return parent.subsheetId;
               }
            } catch (err) {
               console.log('Error finding subsheet:', err);
               return err;
            }
         }
         return null;
      },

      text: async (parent, args, context) => {
         try {
            return parent.subsheetId ? await SheetModel.getSummaryCellContent(parent.subsheetId) : parent.text;
         } catch (err) {
            console.log('Error finding subsheet:', err);
            return err;
         }
      },
   },

   Mutation: {
      createSheet: async (parent, args, context) => {
         const { rows, columns, title, parentSheetId, summaryCell, summaryCellText } = args.input;
         const defaultSheet = createNewSheet({
            totalRows: rows || DEFAULT_ROWS,
            totalColumns: columns || DEFAULT_COLUMNS,
            title: title || DEFAULT_TITLE,
            parentSheetId: parentSheetId || null,
            summaryCell: summaryCell || DEFAULT_SUMMARY_CELL,
            summaryCellText: summaryCellText || '',
         });
         try {
            return await new SheetModel(defaultSheet).save();
         } catch (err) {
            console.log('Error creating sheet:', err);
            return err;
         }
      },

      changeTitle: async (parent, { id, title }, context) => {
         try {
            return await SheetModel.updateTitle(id, title);
         } catch (err) {
            console.log('Error updating title:', err);
            return err;
         }
      },

      updateMetadata: async (parent, args, context) => {
         try {
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
            const savedSheet = await sheetDoc.save();
            return savedSheet.metadata;
         } catch (err) {
            console.log('Error updating metadata:', err);
            return err;
         }
      },

      updateCells: async (parentValue, args, context) => {
         const { id, cells } = args.input;
         try {
            const sheetDoc = await SheetModel.findById(id);
            const updatedCells = updateCells(sheetDoc.cells, cells);
            sheetDoc.cells = updatedCells;
            return await sheetDoc.save();
         } catch (err) {
            console.log('Error updating cells:', err);
            return err;
         }
      },

      deleteSubsheetId: async (parentValue, args, context) => {
         const { sheetId, row, column, text } = args.input;
         try {
            const sheetDoc = await SheetModel.findById(sheetId);
            const updatedCells = deleteSubsheetId(sheetDoc.cells, row, column, text);
            sheetDoc.cells = updatedCells;
            await sheetDoc.save();
            const cell = findCellByRowAndColumn(row, column, sheetDoc.cells);
            return { cell };
         } catch (err) {
            console.log('Error deleting subsheet id:', err);
            return err;
         }
      },

      deleteSheets: async (parentValue, args, context) => {
         try {
            await SheetModel.deleteMany({ _id: { $in: args.ids } });
            return getAllSheets();
         } catch (err) {
            console.log('Error deleting sheets id:', err);
            return err;
         }
      },
   },
});
