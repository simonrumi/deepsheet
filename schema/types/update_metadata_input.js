const graphql = require('graphql');
const { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLList, GraphQLInputObjectType } = graphql;
const SheetSummaryCellInput = require('./sheet_summary_cell_input');
const SheetFilterInput = require('./sheet_filter_input');

const UpdateMetadataInput = new GraphQLInputObjectType({
   description: 'input fields for updating the metadata of a sheet',
   name: 'UpdateMetadataInput',
   fields: {
      id: { type: new GraphQLNonNull(GraphQLID) }, //the sheetId
      totalRows: { type: GraphQLInt },
      totalColumns: { type: GraphQLInt },
      parentSheetId: { type: GraphQLID },
      summaryCell: { type: SheetSummaryCellInput },
      columnFilters: { type: new GraphQLList(SheetFilterInput) },
      rowFilters: { type: new GraphQLList(SheetFilterInput) },
   },
});

module.exports = UpdateMetadataInput;
