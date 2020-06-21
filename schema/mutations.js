const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID } = graphql;
const mongoose = require('mongoose');
const SheetModel = mongoose.model('sheet');
const SheetType = require('./types/sheet_type');

const mutation = new GraphQLObjectType({
   name: 'TitleMutation',
   fields: {
      changeTitle: {
         type: SheetType,
         args: {
            id: { type: GraphQLID },
            title: { type: GraphQLString },
         },
         resolve(parentValue, args, req) {
            console.log('TitleMutation got args', args);
            return SheetModel.updateTitle(args.id, args.title);
         },
      },
   },
});

module.exports = mutation;
