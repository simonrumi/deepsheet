const graphql = require('graphql');
const {
   GraphQLObjectType,
   GraphQLInt,
   GraphQLString,
   GraphQLBoolean,
   GraphQLNonNull,
} = graphql;

const SheetFilterType = new GraphQLObjectType({
   name: 'SheetFilterType',
   fields: {
      index: { type: new GraphQLNonNull(GraphQLInt) },
      filterExpression: { type: new GraphQLNonNull(GraphQLString) },
      caseSensitive: { type: GraphQLBoolean },
      regex: { type: GraphQLBoolean },
   },
});

module.exports = SheetFilterType;
