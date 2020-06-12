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

sheetSchema.statics.getSummaryCellContent = async function (id) {
   const data = await this.findById(id);
   const { row, column } = data.metadata.summaryCell;
   const rowData = await this.findOne(
      { _id: id },
      { rows: { $elemMatch: { row: JSON.stringify(row) } } }
   );
   return rowData.rows[row].columns[column].content;
};

sheetSchema.statics.updateTitle = async function (id, title) {
   return this.findByIdAndUpdate(
      { _id: id },
      { title: title },
      { useFindAndModify: false }, //got a mongoose warning saying this must be set
      function (err, result) {
         if (err) {
            console.log('error in updateTitle', err);
         } else {
            return result;
         }
      }
   );
};
mongoose.model('sheet', sheetSchema);
