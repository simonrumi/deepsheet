const graphql = require('graphql');
const { GraphQLInputObjectType, GraphQLInt, GraphQLString, GraphQLID } = graphql;
const SheetSummaryCellInput = require('./sheet_summary_cell_input');

const NewSheetInput = new GraphQLInputObjectType({
   description: 'input fields for creating a new sheet',
   name: 'NewSheetInput',
   fields: {
      rows: { type: GraphQLInt },
      columns: { type: GraphQLInt },
      title: { type: GraphQLString },
      parentSheetId: { type: GraphQLID },
      summaryCell: { type: SheetSummaryCellInput },
      summaryCellText: { type: GraphQLString },
   },
});

module.exports = NewSheetInput;
