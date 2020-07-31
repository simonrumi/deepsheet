const graphql = require('graphql');
const { GraphQLObjectType, GraphQLInt, GraphQLID, GraphQLList } = graphql;
const SheetFilterType = require('./sheet_filter_type');
const SheetSummaryCellType = require('./sheet_summary_cell_type');

const SheetMetadataType = new GraphQLObjectType({
   name: 'SheetMetadataType',
   fields: {
      totalRows: { type: GraphQLInt },
      totalColumns: { type: GraphQLInt },
      parentSheetId: { type: GraphQLID },
      summaryCell: { type: SheetSummaryCellType },
      columnFilters: { type: new GraphQLList(SheetFilterType) },
      rowFilters: { type: new GraphQLList(SheetFilterType) },
   },
});

module.exports = SheetMetadataType;
