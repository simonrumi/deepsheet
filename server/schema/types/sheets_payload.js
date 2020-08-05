const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList } = graphql;
const SheetType = require('./sheet_type');

const SheetsPayload = new GraphQLObjectType({
   name: 'SheetsPayload',
   description: 'return value when getting a list of all sheets',
   fields: {
      sheets: { type: new GraphQLList(SheetType) },
   },
});

module.exports = SheetsPayload;
