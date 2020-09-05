const Root = require('./root');
const SheetType = require('./sheetType');
const SheetMutations = require('./sheetMutations');
const UserType = require('./userType');
const UserMutations = require('./userMutations');

const schemaArray = [Root, SheetType, SheetMutations, UserType, UserMutations];

module.exports = schemaArray;
