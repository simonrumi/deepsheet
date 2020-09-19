const Root = require('./root');
const SheetType = require('./sheetType');
const SheetMutations = require('./sheetMutations');
const UserType = require('./userType');
const UserMutations = require('./userMutations');
const SessionType = require('./sessionType');

const schemaArray = [Root, SheetType, SheetMutations, UserType, UserMutations, SessionType];

module.exports = schemaArray;
