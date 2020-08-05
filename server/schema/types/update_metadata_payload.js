const { GraphQLObjectType, GraphQLInt, GraphQLID, GraphQLList } = require('graphql');
const SheetMetadataPayload = require('./sheet_metadata_payload');

const UpdateMetadataPayload = new GraphQLObjectType({
   name: 'UpdateMetadataPayload',
   description: 'Metadata type definition',
   fields: () => ({
      metadata: { type: SheetMetadataPayload },
   }),
});

module.exports = UpdateMetadataPayload;
