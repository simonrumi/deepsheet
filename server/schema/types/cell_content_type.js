const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID } = graphql;
const mongoose = require('mongoose');
const { isSomething } = require('../../helpers');
const SheetModel = mongoose.model('sheet');

const CellContentType = new GraphQLObjectType({
   name: 'CellContentType',
   fields: {
      subsheetId: {
         type: GraphQLID,
         async resolve(parentValue, args, context) {
            if (parentValue.subsheetId) {
               try {
                  const subsheet = await SheetModel.findById(parentValue.subsheetId);
                  if (isSomething(subsheet)) {
                     return parentValue.subsheetId;
                  }
               } catch (err) {
                  console.log('Error finding subsheet:', err);
                  return null;
               }
            }
            return null;
         },
      },
      text: {
         type: GraphQLString,
         resolve(parentValue, args, context) {
            return parentValue.subsheetId ? SheetModel.getSummaryCellContent(parentValue.subsheetId) : parentValue.text;
         },
      },
   },
});

module.exports = CellContentType;
