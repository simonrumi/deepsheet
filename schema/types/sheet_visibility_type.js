const graphql = require('graphql');
const R = require('ramda');
const {
   GraphQLObjectType,
   GraphQLInt,
   GraphQLBoolean,
   GraphQLNonNull,
} = graphql;

const SheetVisibilityType = new GraphQLObjectType({
   name: 'SheetVisibilityType',
   fields: {
      index: { type: new GraphQLNonNull(GraphQLInt) },
      isVisible: { type: new GraphQLNonNull(GraphQLBoolean) },
   },
});

module.exports = SheetVisibilityType;
