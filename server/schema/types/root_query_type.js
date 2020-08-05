const graphql = require('graphql');
const mongoose = require('mongoose');
const { GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLID } = graphql;
const SheetType = require('./sheet_type');
const SheetsPayload = require('./sheets_payload');
const { getAllSheets } = require('../../helpers/sheetHelpers');

const SheetModel = mongoose.model('sheet');

const RootQueryType = new GraphQLObjectType({
   name: 'RootQueryType',
   fields: () => ({
      sheet: {
         type: SheetType,
         args: { id: { type: new GraphQLNonNull(GraphQLID) } },
         resolve(parentValue, args) {
            return SheetModel.findById(args.id, (err, sheetDoc) => {
               if (err) {
                  console.log('Error finding sheet:', err);
                  return err;
               }
               return sheetDoc;
            });
         },
      },
      sheets: {
         type: SheetsPayload,
         resolve(parentValue, args, context) {
            return getAllSheets();
         },
      },
   }),
});

module.exports = RootQueryType;
