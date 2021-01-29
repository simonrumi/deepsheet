const R = require('ramda');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const FilterModel = require('./FilterModel');
const FreezeModel = require('./FreezeModel');
const SizingModel = require('./SizingModel');
const CellModel = require('./CellModel');
const { isSomething } = require('../helpers');

const sheetSchema = new Schema(
   {
      users: {
         owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
         collaborators: [
            {
               collaborator: { type: Schema.Types.ObjectId, ref: 'User' },
               permissions: { type: Number },
            },
         ],
      },
      metadata: {
         created: { type: Date, default: Date.now },
         lastUpdated: { type: Date, default: Date.now },
         lastAccessed: { type: Date, default: Date.now },
         totalRows: { type: Number, required: true, default: 10 },
         totalColumns: { type: Number, required: true, default: 5 },
         parentSheetId: { type: Schema.Types.ObjectId, ref: 'Sheet' },
         summaryCell: {
            row: { type: Number },
            column: { type: Number },
         },
         columnFilters: [FilterModel],
         rowFilters: [FilterModel],
         frozenRows: [FreezeModel],
         frozenColumns: [FreezeModel],
         columnWidths: [SizingModel],
         rowHeights: [SizingModel],
      },
      title: { type: String, requried: true, default: 'My Deep Deep Sheet' },
      cells: [CellModel],
   },
   { collection: 'sheets' }
);

const cellsValidator = function (cells) {
   const freeOfDupeCells = R.reduce((accumulator, currentCell) => {
      const dupeCells = R.filter(cell => currentCell.row === cell.row && currentCell.column === cell.column)(
         accumulator
      );
      return R.isEmpty(dupeCells) ? R.append(currentCell, accumulator) : R.reduced(false);
   }, []);
   return freeOfDupeCells(cells) ? true : false;
};

sheetSchema.path('cells').validate(cellsValidator, 'cannot have multiple cells at the same row & column');

sheetSchema.statics.getSummaryCellContent = async function (id) {
   const data = await this.findById(id);
   if (isSomething(data)) {
      const { row, column } = data.metadata.summaryCell;
      const cellData = await this.findOne({ _id: id }, { cells: { $elemMatch: { row: row, column: column } } });
      return cellData.cells[0].content.text;
   }
   return '';
};

mongoose.model('sheet', sheetSchema);
