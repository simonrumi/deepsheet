const R = require('ramda');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const VisibilityModel = require('./VisibilityModel');
const FilterModel = require('./FilterModel');
const RowModel = require('./RowModel');

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
      rows: [RowModel],
   },
   { collection: 'sheets' }
);

sheetSchema.statics.getSummaryCellContent = async function(id) {
   const data = await this.findById(id);
   const { row, column } = data.metadata.summaryCell;
   // all the sheet data is in data.rows. Each row has an array, called rowItems here,
   // each rowItem has an array called columnItems here.
   // each columnItem has a content value
   return R.pipe(
      R.reduce(
         (accumulator, rowItem) =>
            rowItem && rowItem.row === row ? rowItem.columns : accumulator,
         []
      ),
      R.reduce(
         (accumulator, columnItem) =>
            columnItem.column === column ? columnItem.content : accumulator,
         null
      )
   )(data.rows);
};

mongoose.model('sheet', sheetSchema);
