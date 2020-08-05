const graphql = require('graphql');
const { GraphQLInputObjectType, GraphQLString, GraphQLID } = graphql;

const CellContentInput = new GraphQLInputObjectType({
   description: 'input fields for updating one cell',
   name: 'CellContentInput',
   fields: {
      text: { type: GraphQLString },
      subsheetId: { type: GraphQLID },
   },
});

module.exports = CellContentInput;
