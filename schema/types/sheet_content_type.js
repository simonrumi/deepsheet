const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull } = graphql;
const mongoose = require('mongoose');
const SheetModel = mongoose.model('sheet');

const SheetContentType = new GraphQLObjectType({
   name: 'SheetContentType',
   fields: {
      subsheetId: { type: GraphQLID },
      text: {
         type: GraphQLString,
         resolve(parentValue, args, context) {
            return parentValue.subsheetId
               ? SheetModel.getSummaryCellContent(parentValue.subsheetId)
               : parentValue;
         },
      },
   },
});

module.exports = SheetContentType;
