const graphql = require('graphql');
const { GraphQLNonNull, GraphQLInputObjectType, GraphQLInt, GraphQLBoolean } = graphql;
const CellContentInput = require('./cell_content_input');

const CellInput = new GraphQLInputObjectType({
   description: 'input fields for updating one cell',
   name: 'CellInput',
   fields: {
      row: { type: new GraphQLNonNull(GraphQLInt) },
      column: { type: new GraphQLNonNull(GraphQLInt) },
      visible: { type: new GraphQLNonNull(GraphQLBoolean) },
      content: { type: CellContentInput },
   },
});

module.exports = CellInput;
