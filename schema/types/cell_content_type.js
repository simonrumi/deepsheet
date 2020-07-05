const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID } = graphql;
const mongoose = require('mongoose');
const SheetModel = mongoose.model('sheet');

const CellContentType = new GraphQLObjectType({
   name: 'CellContentType',
   fields: {
      subsheetId: { type: GraphQLID },
      text: {
         type: GraphQLString,
         resolve(parentValue, args, context) {
            return parentValue.subsheetId ? SheetModel.getSummaryCellContent(parentValue.subsheetId) : parentValue.text;
         },
      },
   },
});

module.exports = CellContentType;
