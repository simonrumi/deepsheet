const graphql = require('graphql');
const {
   GraphQLUnionType,
   GraphQLObjectType,
   GraphQLString,
   GraphQLID,
   GraphQLNonNull,
} = graphql;
const mongoose = require('mongoose');
const SheetModel = mongoose.model('sheet');

const SheetStringContentType = new GraphQLObjectType({
   name: 'SheetStringContentType',
   fields: {
      text: {
         type: GraphQLString,
         resolve(parentValue, args, context) {
            return parentValue;
         },
      },
   },
});

const SubSheetContentType = new GraphQLObjectType({
   name: 'SubSheetContentType',
   fields: {
      subsheetId: {
         type: GraphQLID,
         resolve(parentValue, args, context) {
            return parentValue.subsheetId;
         },
      },
      subsheetSummaryCellContent: {
         type: GraphQLString, // should probably be SheetContentType
         resolve(parentValue, args, context) {
            return SheetModel.getSummaryCellContent(parentValue.subsheetId);
         },
      },
   },
});

const SheetContentType = new GraphQLUnionType({
   name: 'SheetContentType',
   types: [SheetStringContentType, SubSheetContentType],
   resolveType(value) {
      switch (typeof value) {
         case 'string':
            return SheetStringContentType;
         case 'object':
            return SubSheetContentType;
      }
   },
});

module.exports = SheetContentType;
