const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID } = graphql;
const mongoose = require('mongoose');
const SheetModel = mongoose.model('sheet');
const SheetType = require('./types/sheet_type');

const mutation = new GraphQLObjectType({
   name: 'Mutation', // QQQ where is this name showing up?
   fields: {
      changeTitle: {
         type: SheetType,
         args: {
            id: { type: GraphQLID },
            title: { type: GraphQLString },
         },
         resolve(parentValue, args, req) {
            return SheetModel.updateTitle(args.id, args.title);
         },
      },
   },
});

module.exports = mutation;
