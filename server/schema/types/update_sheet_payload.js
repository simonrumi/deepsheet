const { GraphQLObjectType, GraphQLNonNull } = require('graphql');
const SheetType = require('./sheet_type');

const UpdateSheetPayload = new GraphQLObjectType({
   name: 'UpdateSheetPayload',
   description: 'Sheet type definition',
   fields: () => ({
      sheet: { type: new GraphQLNonNull(SheetType) },
   }),
});

module.exports = UpdateSheetPayload;
