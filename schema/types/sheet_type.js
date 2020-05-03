const graphql = require('graphql');
const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLList } = graphql;
const SheetMetadataType = require('./sheet_metadata_type');
const SheetRowType = require('./sheet_row_type');

const SheetType = new GraphQLObjectType({
   name: 'SheetType',
   fields: {
      id: { type: GraphQLID },
      metadata: { type: SheetMetadataType },
      title: { type: GraphQLString },
      rows: { type: new GraphQLList(SheetRowType) },
   },
});

module.exports = SheetType;

/***** temp note on how to query this
query SheetQuery($id: ID!) {
  sheet(id: $id) {
    id
    title
    metadata {
      totalRows
      totalColumns
      parentSheetId
      columnVisibility {
        index
        isVisible
      }
      rowVisibility {
        index
        isVisible
      }
      columnFilters {
        index
        filterExpression
        caseSensitive
        regex
      }
      rowFilters {
        index
        filterExpression
        caseSensitive
        regex
      }
    }
    rows {
      row
      columns {
        row
        column
        content {
          ... on SheetStringContentType {
            text
          }
          ... on SubSheetContentType {
            subsheetId
          }
        }
        visible
      }
    }
  }
}
***********/
