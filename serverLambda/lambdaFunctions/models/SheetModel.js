const R = require('ramda');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { Schema } = mongoose;
const FilterModel = require('./FilterModel');
const FreezeModel = require('./FreezeModel');
const SizingModel = require('./SizingModel');
const CellModel = require('./CellModel');

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
   return data?.title;
};

mongoose.model('sheet', sheetSchema);
