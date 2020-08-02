const graphql = require('graphql');
const mongoose = require('mongoose');
const { GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLID } = graphql;
const SheetType = require('./sheet_type');
const SheetsPayload = require('./sheets_payload');

const SheetModel = mongoose.model('sheet');

const RootQueryType = new GraphQLObjectType({
   name: 'RootQueryType',
   fields: () => ({
      sheet: {
         type: SheetType,
         args: { id: { type: new GraphQLNonNull(GraphQLID) } },
         resolve(parentValue, args) {
            console.log('getting sheet for id', args.id);
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
            console.log('will need to updated root_query_type.sheets to get sheets only for a user');
            const sheets = SheetModel.find({}, (err, sheetDocs) => {
               if (err) {
                  console.log('Error returning all sheets', err);
                  return err;
               }
               return sheetDocs;
            }).limit(50);
            console.log('!! currently limiting number of sheets returned!!');
            return { sheets };
         },
      },
   }),
});

module.exports = RootQueryType;
