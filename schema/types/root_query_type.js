const graphql = require('graphql');
const { GraphQLObjectType, GraphQLNonNull, GraphQLID } = graphql;
const SheetType = require('./sheet_type');
const mongoose = require('mongoose');

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
   }),
});

module.exports = RootQueryType;
