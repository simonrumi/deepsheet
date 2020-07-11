const graphql = require('graphql');
const { GraphQLNonNull, GraphQLInputObjectType, GraphQLInt, GraphQLBoolean } = graphql;

const SheetVisibilityInput = new GraphQLInputObjectType({
   description: 'input fields for updating visibility objects',
   name: 'SheetVisibilityInput',
   fields: {
      index: { type: new GraphQLNonNull(GraphQLInt) },
      isVisible: { type: new GraphQLNonNull(GraphQLBoolean) },
   },
});

module.exports = SheetVisibilityInput;
