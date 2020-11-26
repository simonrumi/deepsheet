const R = require('ramda');
// note that we have to create the Models first, before requiring in code below that relies on them
const mongoose = require('mongoose');
require('./models/SheetModel');
const SheetModel = mongoose.model('sheet');
require('./models/UserModel');
const UserModel = mongoose.model('user');
require('./models/SessionModel');
const { isSomething, isNothing, arrayContainsSomething, runIfSomething } = require('./helpers');
const { getAllSheetsForUser, createNewSheet, getLatestSheet } = require('./helpers/sheetHelpers');
const { addSheetToUser } = require('./helpers/userHelpers');
const {
   updateAndAddCells,
   deleteSubsheetId,
   findCellByRowAndColumn,
   maybeGetUpdatedSummaryCell,
   updateSubsheetCellContent,
} = require('./helpers/updateCellsHelpers');
const { AuthenticationError } = require('apollo-server-lambda');

module.exports = db => ({
   Query: {
      sheet: async (parent, args, context) => {
         try {
            const sheetResult = await SheetModel.findOne({ _id: args.sheetId, 'users.owner': args.userId });
            return sheetResult;
         } catch (err) {
            console.log('Error finding sheet:', err);
            return err;
         }
      },

      sheets: async (parent, args, context) => {
         return await getAllSheetsForUser(args.userId);
      },

      subsheetId: async (parent, args, context) => {
         if (parent.subsheetId) {
            try {
               const subsheet = await SheetModel.findById(parent.subsheetId);
               if (isSomething(subsheet)) {
                  return parent.subsheetId;
               }
            } catch (err) {
               console.log('Error finding subsheet:', err);
               return err;
            }
         }
         return null;
      },

      text: async (parent, args, context) => {
         try {
            return parent.subsheetId ? await SheetModel.getSummaryCellContent(parent.subsheetId) : parent.text;
         } catch (err) {
            console.log('Error finding subsheet:', err);
            return err;
         }
      },

      user: async (parent, args, context) => {
         try {
            const userResult = UserModel.findById(args.userId);
            return userResult;
         } catch (err) {
            console.log('Error finding user:', err);
            return err;
         }
      },
   },

   // TODO check userId is owner of the sheet before making any mutations. In future will have to check that non-owners have write permission 
   Mutation: {
      createSheet: async (parent, args, context) => {
         const sheetObj = createNewSheet(args.input);
         try {
            const newSheet = await new SheetModel(sheetObj).save();
            try {
               await addSheetToUser({ userId: args.input.userId, sheetId: newSheet._id });
            } catch (err) {
               console.log('After creating new sheet, was not able to add sheet to user');
               await SheetModel.deleteOne({ _id: newSheet._id }); // maybe this also throws an error, if so we'll have an orphaned sheet...not the end of the world
               return err;
            }
            return newSheet;
         } catch (err) {
            console.log('Error creating sheet:', err);
            return err;
         }
      },

      sheetByUserId: async (parent, args, context) => {
         try {
            const user = await UserModel.findById(args.userId);
            if (isNothing(user)) {
               return new Error('no user found');
            }
            if (isNothing(user.sheets) || !arrayContainsSomething(user.sheets)) {
               const defaultSheet = createNewSheet(args);
               const newSheet = await new SheetModel(defaultSheet).save();
               await addSheetToUser({ user, sheetId: newSheet._id });
               return newSheet;
            }
            // const sheetResult = await SheetModel.findOne(sheetId);
            const sheetResult = await getLatestSheet(user.sheets);
            return sheetResult;
         } catch (err) {
            console.log('Error finding sheet by user id:', err);
            return err;
         }
      },

      changeTitle: async (parent, { id, title }, context) => {
         try {
            const sheetDoc = await SheetModel.findById(id);
            sheetDoc.title = title;
            sheetDoc.metadata.lastUpdated = new Date();
            const savedSheet = await sheetDoc.save();
            return savedSheet;
         } catch (err) {
            console.log('Error updating title:', err);
            return err;
         }
      },

      updateMetadata: async (parent, args, context) => {
         try {
            // args.input has all the metadata fields (see below) plus the sheet's id
            const sheetDoc = await SheetModel.findById(args.input.id);
            const newMetadata = R.mergeAll([
               sheetDoc.toObject().metadata, //toObject() gets rid of any weird props included from mongoose
               R.pick(
                  [
                     'totalRows',
                     'totalColumns',
                     'parentSheetId',
                     'summaryCell',
                     'columnVisibility',
                     'rowVisibility',
                     'columnFilters',
                     'rowFilters',
                     'frozenColumns',
                     'frozenRows',
                  ],
                  args.input
               ),
               { lastUpdated: new Date() }
            ]);
            sheetDoc.metadata = newMetadata;
            const savedSheet = await sheetDoc.save();
            return savedSheet.metadata;
         } catch (err) {
            console.log('Error updating metadata:', err);
            return err;
         }
      },

      updateCells: async (parent, args, context) => {
         const { sheetId, cells, userId } = args.input;
         try {
            const sheetDoc = await SheetModel.findById(sheetId);
            if (sheetDoc.users.owner != userId) {
               return new Error('User not authorized to update sheet');
            }
            const updatedCells = updateAndAddCells(sheetDoc.cells, cells);
            const updatedSummaryCell = maybeGetUpdatedSummaryCell(sheetDoc, updatedCells);
            if (isSomething(updatedSummaryCell)) {
               const parentSheetId = sheetDoc.metadata.parentSheetId;
               if (parentSheetId) {
                  const parentSheetDoc = await SheetModel.findById(parentSheetId);
                  const updatedParentCells = runIfSomething(
                     updateSubsheetCellContent, // fn to run
                     parentSheetDoc, // only run fn if this is not empty
                     updatedSummaryCell, sheetId // additional parameters for updateSubsheetCellContent
                  );
                  parentSheetDoc.cells = updatedParentCells;
                  parentSheetDoc.metadata.lastUpdated = new Date();
                  await parentSheetDoc.save();
               }
            }
            sheetDoc.cells = updatedCells;
            sheetDoc.metadata.lastUpdated = new Date();
            return await sheetDoc.save();
         } catch (err) {
            console.log('Error updating cells:', err);
            return err;
         }
      },

      // TODO should give user the option to delete the whole subsheet also
      /* This is to remove a cell's connection to a subsheet, while preserving the text in the cell from the subsheet */
      deleteSubsheetId: async (parent, args, context) => {
         const { sheetId, row, column, text, subsheetId } = args.input;
         try {
            // remove the subsheetId from the cell which links to it
            const sheetDoc = await SheetModel.findById(sheetId);
            const updatedCells = deleteSubsheetId(sheetDoc.cells, row, column, text);
            sheetDoc.cells = updatedCells;
            sheetDoc.metadata.lastUpdated = new Date();
            await sheetDoc.save();

            // remove the reference to the parent from the subsheet
            const subsheetDoc = await SheetModel.findById(subsheetId);
            subsheetDoc.metadata.parentSheetId = null;
            await subsheetDoc.save();

            // return the cell that has had the subsheet unlinked from it
            const cell = findCellByRowAndColumn(row, column, sheetDoc.cells);
            return cell;
         } catch (err) {
            console.log('Error deleting subsheet id:', err);
            return err;
         }
      },

      // not used so far
      deleteSheet: async (parent, args, context) => {
         try {
            const sheetToDelete = SheetModel.findById(args.sheetId);
            if (sheetToDelete.users.owner !== args.userId) {
               return new AuthenticationError('sheets can only be deleted by their owner');
            }
            await SheetModel.deleteOne({ _id: args.sheetId });
            return getAllSheetsForUser(args.userId);
         } catch (err) {
            console.log('Error deleting sheet', err);
            return err;
         }
      },

      deleteSheets: async (parent, args, context) => {
         const sheetIdsToDelete = args.ids;
         try {
            await SheetModel.deleteMany({ _id: { $in: sheetIdsToDelete } }); // delete the sheets
            await UserModel.updateMany({}, { $pullAll: { sheets: sheetIdsToDelete } }); // remove the deleted sheets from all the users
            return getAllSheetsForUser(args.userId);
         } catch (err) {
            console.log('Error deleting sheets id:', err);
            return err;
         }
      },
   },
});

// createUser: async (parent, args, context) => {
//    const { isValid, error } = await validateNewUser(args.input);
//    if (!isValid) {
//       return error;
//    }
//    try {
//       const newUser = await new UserModel(args.input).save();
//       return newUser;
//    } catch (err) {
//       console.log('Error creating user:', err);
//       return err;
//    }
// },

// note that we haven't ended up using this because sessions are handled by authReturn.js which is talking directly to mongodb
/* createUserSession: async (parent, args, context) => {
         const { userId, email, userIdFromProvider } = args.input;

         const createSession = async () => {
            try {
               const newSession = await new SessionModel().save();
               return newSession;
            } catch (err) {
               console.log('Error creating session:', err);
               return err;
            }
         };

         const returnError = () => {
            console.log('could not create session');
            return new Error('could not create session');
         };

         return R.ifElse(arrayContainsSomething, createSession, returnError)([userId, email, userIdFromProvider]);
      }, */

// note that we haven't ended up using this because sessions are handled by authReturn.js which is talking directly to mongodb
/* refreshUserSession: async (parent, args, context) => {
         try {
            const currentSession = await SessionModel.findById(args.sessionId);
            console.log('refreshUserSession got currentSession', currentSession);
            if (currentSession) {
               currentSession.lastAccessed = Date.now();
               const refreshsedSession = await currentSession.save();
               return refreshsedSession;
            }
            return null; // will need to create a new session in this case
         } catch (err) {
            console.log('error refreshing session', err);
            return err;
         }
      }, */
