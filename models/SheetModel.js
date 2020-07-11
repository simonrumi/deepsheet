const R = require('ramda');
const mongoose = require('mongoose');
const { Schema, Query, Document } = mongoose;
const VisibilityModel = require('./VisibilityModel');
const FilterModel = require('./FilterModel');
const CellModel = require('./CellModel');

const sheetSchema = new Schema(
   {
      metadata: {
         totalRows: { type: Number, required: true, default: 10 },
         totalColumns: { type: Number, required: true, default: 5 },
         parentSheetId: { type: Schema.Types.ObjectId, ref: 'Sheet' },
         summaryCell: {
            row: { type: Number },
            column: { type: Number },
         },
         columnVisibility: [VisibilityModel],
         rowVisibility: [VisibilityModel],
         columnFilters: [FilterModel],
         rowFilters: [FilterModel],
      },
      title: { type: String, requried: true, default: 'My Deep Deep Sheet' },
      cells: [CellModel],
   },
   { collection: 'sheets' }
);

sheetSchema.index({ 'cells.row': 1, 'cells.column': 1 }, { unique: true });

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
   const { row, column } = data.metadata.summaryCell;
   const cellData = await this.findOne({ _id: id }, { cells: { $elemMatch: { row: row, column: column } } });
   return cellData.cells[0].content.text;
};

sheetSchema.statics.updateTitle = async function (id, title) {
   return this.findByIdAndUpdate(
      { _id: id },
      { title: title },
      { useFindAndModify: false }, //got a mongoose warning saying this must be set
      function (err, result) {
         if (err) {
            console.log('error in updateTitle', err);
         }
         return result;
      }
   );
};

mongoose.model('sheet', sheetSchema);
