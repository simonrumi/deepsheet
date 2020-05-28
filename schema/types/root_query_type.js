const graphql = require('graphql');
const { GraphQLObjectType, GraphQLNonNull, GraphQLID } = graphql;
const SheetType = require('./sheet_type');
const mongoose = require('mongoose');

const Sheet = mongoose.model('sheet');

const RootQueryType = new GraphQLObjectType({
   name: 'RootQueryType',
   fields: () => ({
      sheet: {
         type: SheetType,
         args: { id: { type: new GraphQLNonNull(GraphQLID) } },
         resolve(parentValue, args) {
            return Sheet.findById(args.id, (err, sheet) => {
               if (err) {
                  return err;
               }
               return sheet;
            });
         },
      },
   }),
});

module.exports = RootQueryType;
