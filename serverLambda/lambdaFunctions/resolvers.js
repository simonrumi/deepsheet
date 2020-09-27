const R = require('ramda');
// note that we have to create the Models first, before requiring in code below that relies on them
const mongoose = require('mongoose');
require('./models/SheetModel');
const SheetModel = mongoose.model('sheet');
require('./models/UserModel');
const UserModel = mongoose.model('user');
require('./models/SessionModel');
const { isSomething, isNothing } = require('./helpers');
const { getAllSheets, createNewSheet } = require('./helpers/sheetHelpers');
const { updateCells, deleteSubsheetId, findCellByRowAndColumn } = require('./helpers/updateCellsHelpers');
const { DEFAULT_ROWS, DEFAULT_COLUMNS, DEFAULT_TITLE, DEFAULT_SUMMARY_CELL } = require('../constants');
const { AuthenticationError } = require('apollo-server-lambda');

module.exports = db => ({
   Query: {
      sheet: async (parent, args, context) => {
         console.log('running sheet query with args', args);
         try {
            const sheetResult = await SheetModel.findById(args.sheetId);
            return sheetResult;
         } catch (err) {
            console.log('Error finding sheet:', err);
            return err;
         }
      },

      sheetByUserId: async (parent, args, context) => {
         console.log('running sheetByUserId query with args', args);
         try {
            const user = await UserModel.findById(args.userId);
            if (isNothing(user)) {
               return new Error('no user found');
            }
            console.log('sheetByUserId got user', user);
            const sheetId = user.sheets[0];
            console.log('sheetByUserId got sheetId', sheetId);
            if (isNothing(sheetId)) {
               return new Error('no sheet found for user. TODO need to create sheet in this case');
            }
            const sheetResult = await SheetModel.findOne(sheetId);
            console.log('sheetByUserId got sheet', sheetResult);
            return sheetResult;
         } catch (err) {
            console.log('Error finding sheet by user id:', err);
            return err;
         }
      },

      sheets: async (parent, args, context) => {
         return await getAllSheets();
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

   Mutation: {
      createSheet: async (parent, args, context) => {
         console.log('createSheet resolver got context', context);
         if (!context.isAuthorized) {
            // ***********TOOD NEXT This doesn;t work:
            // return await makeAuthCall({ action: 'createSheet', data: args.input });
            // because how do we redirect from this mutation?
            // .....so watch S Grider's videos to see how he routes people to login flow
            // might need to do it on the client, based on some auth cookie
            return new AuthenticationError('User must log in first');
         }
         const { rows, columns, title, parentSheetId, summaryCell, summaryCellText } = args.input;
         const defaultSheet = createNewSheet({
            totalRows: rows || DEFAULT_ROWS,
            totalColumns: columns || DEFAULT_COLUMNS,
            title: title || DEFAULT_TITLE,
            parentSheetId: parentSheetId || null,
            summaryCell: summaryCell || DEFAULT_SUMMARY_CELL,
            summaryCellText: summaryCellText || '',
         });
         try {
            const newSheet = await new SheetModel(defaultSheet).save();
            return newSheet;
            // for some reason doing the above in a single line like this doesn't work...don't be tempted:
            // return await new SheetModel(defaultSheet).save();
         } catch (err) {
            console.log('Error creating sheet:', err);
            return err;
         }
      },

      changeTitle: async (parent, { id, title }, context) => {
         try {
            return await SheetModel.updateTitle(id, title);
         } catch (err) {
            console.log('Error updating title:', err);
            return err;
         }
      },

      updateMetadata: async (parent, args, context) => {
         try {
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
                  ],
                  args.input
               ),
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
         const { id, cells } = args.input;
         try {
            const sheetDoc = await SheetModel.findById(id);
            const updatedCells = updateCells(sheetDoc.cells, cells);
            sheetDoc.cells = updatedCells;
            return await sheetDoc.save();
         } catch (err) {
            console.log('Error updating cells:', err);
            return err;
         }
      },

      deleteSubsheetId: async (parent, args, context) => {
         const { sheetId, row, column, text } = args.input;
         try {
            const sheetDoc = await SheetModel.findById(sheetId);
            const updatedCells = deleteSubsheetId(sheetDoc.cells, row, column, text);
            sheetDoc.cells = updatedCells;
            await sheetDoc.save();
            const cell = findCellByRowAndColumn(row, column, sheetDoc.cells);
            return { cell };
         } catch (err) {
            console.log('Error deleting subsheet id:', err);
            return err;
         }
      },

      deleteSheets: async (parent, args, context) => {
         try {
            await SheetModel.deleteMany({ _id: { $in: args.ids } });
            return getAllSheets();
         } catch (err) {
            console.log('Error deleting sheets id:', err);
            return err;
         }
      },

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
               console.log('created session', newSession);
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
            console.log('refreshUserSession got args', args);
            const currentSession = await SessionModel.findById(args.sessionId);
            console.log('refreshUserSession got currentSession', currentSession);
            if (currentSession) {
               currentSession.lastAccessed = Date.now();
               const refreshsedSession = await currentSession.save();
               console.log('refreshsedSession is', refreshsedSession);
               return refreshsedSession;
            }
            return null; // will need to create a new session in this case
         } catch (err) {
            console.log('error refreshing session', err);
            return err;
         }
      }, */
   },
});
