const graphql = require('graphql');
const { GraphQLNonNull, GraphQLInputObjectType, GraphQLInt, GraphQLString, GraphQLBoolean } = graphql;

const SheetFilterInput = new GraphQLInputObjectType({
   description: 'input fields for updating filter objects',
   name: 'SheetFilterInput',
   fields: {
      index: { type: new GraphQLNonNull(GraphQLInt) },
      filterExpression: { type: new GraphQLNonNull(GraphQLString) },
      caseSensitive: { type: GraphQLBoolean },
      regex: { type: GraphQLBoolean },
   },
});

module.exports = SheetFilterInput;
