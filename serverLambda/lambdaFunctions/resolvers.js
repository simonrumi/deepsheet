import R from 'ramda';
// note that we have to create the Models first, before requiring in code below that relies on them
import mongoose from 'mongoose';
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
require('./models/HistoryModel');
const HistoryModel = mongoose.model('history');
require('./models/SheetModel');
const SheetModel = mongoose.model('sheet');
require('./models/UserModel');
const UserModel = mongoose.model('user');
require('./models/SessionModel');
import { isSomething, isNothing, arrayContainsSomething } from './helpers';
const {
   getAllSheetsForUser,
   createNewSheet,
   createNewSheetHistory,
   saveSheetHistory,
   getLatestSheet,
   getLatestSheetHistory,
} = require('./helpers/sheetHelpers');
import { addSheetToUser } from './helpers/userHelpers';
const {
   updateAndAddCells,
	updateAndAddFloatingCells,
	removeDeletedCells, 
	removeDeletedFloatingCells,
   deleteSubsheetId,
   findCellByRowAndColumn,
   updateParentWithSubsheetTitle,
} = require('./helpers/updateCellsHelpers');
// const { AuthenticationError } = require('apollo-server-lambda'); // TIDY old version
import { AuthenticationError } from '@apollo/server';
import { log } from './helpers/logger';
import { LOG } from '../constants';

const resolvers = db => ({
   Query: {
      sheet: async (parent, args, context) => {
         try {
            const startTime = log({ level: LOG.VERBOSE, printTime: true }, 'resolvers--Query--sheet starting findOne query for sheetId', args.sheetId, 'userId', args.userId);
            const sheetResult = await SheetModel.findOne({ _id: args.sheetId, 'users.owner': args.userId });
            log({ level: LOG.DEBUG, startTime }, 'resolvers--Query--sheet finished findOne query got sheetResult', sheetResult);
            return sheetResult;
         } catch (err) {
            log({ level: LOG.ERROR}, 'resolvers--Query--sheet error finding sheet:', err.message);
            return err;
         }
      },

      sheets: async (parent, args, context) => {
         log({ level: LOG.VERBOSE, printTime: true }, 'resolvers.Query.sheets about to call getAllSheetsForUser with userId', args.userId);
         return await getAllSheetsForUser(args.userId);
      },

      subsheetId: async (parent, args, context) => {
         if (parent.subsheetId) {
            try {
               log({ level: LOG.VERBOSE, printTime: true }, 'resolvers.Query.subsheetId starting findById query for subsheetId', parent.subsheetId);
               const subsheet = await SheetModel.findById(parent.subsheetId);
               log({ level: LOG.VERBOSE, startTime }, 'resolvers.Query.subsheetId finished findbyId query.');
               if (isSomething(subsheet)) {
                  return parent.subsheetId;
               }
            } catch (err) {
               log({ level: LOG.ERROR}, 'resolvers.Query.subsheetId error finding subsheet:', err.message);
               return err;
            }
         }
         return null;
      },

      text: async (parent, args, context) => {
         try {
            return parent.subsheetId ? await SheetModel.getSummaryCellContent(parent.subsheetId) : parent.text;
         } catch (err) {
            log({ level: LOG.ERROR}, 'resolvers.Query.text error finding subsheet:', err.message);
            return err;
         }
      },

      user: async (parent, args, context) => {
         try {
            const userResult = UserModel.findById(args.userId);
            return userResult;
         } catch (err) {
            log({ level: LOG.ERROR}, 'resolvers.Query.user error finding user:', err.message);
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
               log({ level: LOG.ERROR}, 'resolvers.Mutation.createSheet after creating new sheet, was not able to add sheet to user', err.message);
               try {
                  await SheetModel.deleteOne({ _id: newSheet._id });
               } catch (err) {
                  log({ level: LOG.ERROR}, 'resolvers.Mutation.createSheet Failed to delete the orphaned sheet with id', newSheet._id, err.message);
                  // ...so we'll have an orphaned sheet...not the end of the world
               }
               return err;
            }
            log({ level: LOG.DEBUG}, 'resolvers.Mutation.createSheet will return newSheet:', newSheet);
            return newSheet;
         } catch (err) {
            log({ level: LOG.ERROR}, 'resolvers.Mutation.createSheet Error creating sheet:', err.message);
            return err;
         }
      },

		sheetHistory: async (parent, args, context) => {
         try {
				const startTime = log({ level: LOG.VERBOSE, printTime: true }, 'resolvers--Mutation--sheetHistory starting find query for sheetId', args.sheetId, 'userId', args.userId);
            const historyResult = await HistoryModel.find({ present: { _id: args.sheetId }, 'users.owner': args.userId });

				if (isNothing(historyResult)) {
					const sheetResult = await SheetModel.findOne({ _id: args.sheetId, 'users.owner': args.userId });

					if (isNothing(sheetResult)) {
						log({ level: LOG.DEBUG, startTime }, 'resolvers--Mutation--sheetHistory was unsuccessfull finding a sheet history for sheetId ', args.sheetId);
						console.log('resolvers--Mutation--sheetHistory no history found for sheet id', args.sheetId)
						return new Error('no sheet history found for sheet id', args.sheetId);
					}

					const newSheetHistory = createNewSheetHistory({ existingSheet: sheetResult });
					log({ level: LOG.DEBUG, startTime }, 'resolvers--Mutation--sheetHistory found a sheet without a history, so made a newSheetHistory', newSheetHistory);
					return newSheetHistory;
				}

				log({ level: LOG.DEBUG, startTime }, 'resolvers--Mutation--sheetHistory finished findOne query got historyResult', historyResult);
            return historyResult;
			} catch(err) {
				log({ level: LOG.ERROR}, 'resolvers--Mutation--sheetHistory error finding sheetHistory:', err.message);
			}
		},

		sheetHistoryByUserId: async (parent, args, context) => {
         try {
				const startTime = log({ level: LOG.VERBOSE, printTime: true }, 'resolvers--Mutation--sheetHistoryByUserId starting findById query for userId', args.userId);
            const user = await UserModel.findById(args.userId);
            log({ level: LOG.VERBOSE, startTime }, 'resolvers--Mutation--sheetHistoryByUserId finished findbyId query.');
            if (isNothing(user)) {
               return new Error('no user found');
            }
				
				if (isNothing(user.sheets) || !arrayContainsSomething(user.sheets)) {
					console.log('resolvers--Mutation--sheetHistoryByUserId about to createNewSheetHistory with args', args);
               const defaultSheetHistory = createNewSheetHistory(args);
					return await saveSheetHistory({ user, defaultSheetHistory });
            }

				const latestSheetHistory = await getLatestSheetHistory(user.sheets);
				console.log('resolvers--Mutation--sheetHistoryByUserId got latestSheetHistory ', latestSheetHistory);
				if (isNothing(latestSheetHistory)) {
					const existingSheet = await getLatestSheet(user.sheets);
					const defaultSheetHistory = createNewSheetHistory({ ...args, existingSheet });
               return await saveSheetHistory({ user, defaultSheetHistory });
				}
				return latestSheetHistory;
			} catch (err) {
            log({ level: LOG.ERROR }, 'resolvers--Mutation--sheetHistoryByUserId Error:', err.message);
            return err;
         }
      },

		/* TIDY - was in the middle of making this, but seems like Query--subsheetId above is just for getting the id, not the whole sheet, 
		so that will work...no need to do a special history version of subsheetId query
		 
		subsheetId: async (parent, args, context) => {
         if (parent.subsheetId) {
            try {
               log({ level: LOG.VERBOSE, printTime: true }, 'resolvers--Mutation--subsheetId starting find query for subsheetId', parent.subsheetId);
               const subHistory = await HistoryModel.find({ present: { _id: parent.subsheetId } });

					if (isNothing(subHistory)) {
						const subsheet = await SheetModel.findById(parent.subsheetId);
						if (isSomething(subsheet)) {
							const defaultSheetHistory = createNewSheetHistory({ existingSheet: subsheet });
               		return await saveSheetHistory({ user, defaultSheetHistory });
							
						}
					}
               log({ level: LOG.VERBOSE, startTime }, 'resolvers--Mutation--subsheetId finished findbyId query.');
               if (isSomething(subsheet)) {
                  return parent.subsheetId;
               }
            } catch (err) {
               log({ level: LOG.ERROR}, 'resolvers--Mutation--subsheetId error finding subsheet:', err.message);
               return err;
            }
         }
         return null;
      }, */

      sheetByUserId: async (parent, args, context) => {
         try {
            const startTime = log({ level: LOG.VERBOSE, printTime: true }, 'resolvers.Mutation.sheetByUserId starting findById query for userId', args.userId);
            const user = await UserModel.findById(args.userId);
            log({ level: LOG.VERBOSE, startTime }, 'resolvers.Mutation.sheetByUserId finished findbyId query.');
            if (isNothing(user)) {
               return new Error('no user found');
            }
            if (isNothing(user.sheets) || !arrayContainsSomething(user.sheets)) {
               const defaultSheet = createNewSheet(args);
               const newSheet = await new SheetModel(defaultSheet).save();
               await addSheetToUser({ user, sheetId: newSheet._id });
               return newSheet;
            }
            return await getLatestSheet(user.sheets);
         } catch (err) {
            log({ level: LOG.ERROR }, 'resolvers--Mutation--sheetByUserId Error finding sheet by user id:', err.message);
            return err;
         }
      },

      changeTitle: async (parent, { id, title }, context) => {
         try {
            const sheetDoc = await SheetModel.findById(id);
            sheetDoc.title = title;
            sheetDoc.metadata.lastUpdated = new Date();
            const savedSheet = await sheetDoc.save();
            if (isSomething(sheetDoc.metadata.parentSheetId)) {
               const parentSheet = await SheetModel.findById(sheetDoc.metadata.parentSheetId);
               parentSheet.cells = updateParentWithSubsheetTitle(parentSheet, sheetDoc);
               await parentSheet.save();
            }
            return savedSheet;
         } catch (err) {
            log({ level: LOG.ERROR }, 'resolvers--Mutation--changeTitle Error updating title:', err.message);
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
                     'columnVisibility',
                     'rowVisibility',
                     'columnFilters',
                     'rowFilters',
                     'frozenColumns',
                     'frozenRows',
                     'rowHeights',
                     'columnWidths',
                  ],
                  args.input
               ),
               { lastUpdated: new Date() }
            ]);
            sheetDoc.metadata = newMetadata;
            const savedSheet = await sheetDoc.save();
            return savedSheet.metadata;
         } catch (err) {
            log({ level: LOG.ERROR }, 'resolvers--Mutation--updateMetadata Error updating metadata:', err.message);
            return err;
         }
      },

      updateSheetLastAccessed: async (parent, args, context) => {
         try {
            const sheetDoc = await SheetModel.findById(args.id);
            sheetDoc.metadata.lastAccessed = args.lastAccessed;
            const savedSheet = await sheetDoc.save();
            return savedSheet;
         } catch (err) {
            log({ level: LOG.ERROR }, 'resolvers--Mutation--updateSheetLastAccessed', err.message);
            return err;
         }
      },

		updateCells: async (parent, args, context) => {
         const { sheetId, cells, floatingCells, userId } = args.input;
         try {
            const sheetDoc = await SheetModel.findById(sheetId);
            if (sheetDoc.users.owner != userId) {
               return new Error('User not authorized to update sheet');
            }
            const updatedCells = updateAndAddCells(sheetDoc, cells);
				sheetDoc.cells = updatedCells;

				const updatedFloatingCells = updateAndAddFloatingCells(sheetDoc, floatingCells);
				sheetDoc.floatingCells = updatedFloatingCells;

            sheetDoc.metadata.lastUpdated = new Date();
            return await sheetDoc.save();
         } catch (err) {
            log({ level: LOG.ERROR }, 'resolvers--Mutation--updateCells Error updating cells:', err.message);
            return err;
         }
      },

		deleteCells: async (parent, args, context) => {
			const { sheetId, cells = [], floatingCells = [], userId } = args.input;
			try {
				const sheetDoc = await SheetModel.findById(sheetId);
            if (sheetDoc.users.owner != userId) {
               return new Error('User not authorized to update sheet');
            }
				const updatedCells = removeDeletedCells(sheetDoc, cells);
				sheetDoc.cells = updatedCells;

				const updatedFloatingCells = removeDeletedFloatingCells(sheetDoc, floatingCells);
				sheetDoc.floatingCells = updatedFloatingCells;

				sheetDoc.metadata.lastUpdated = new Date();
            return await sheetDoc.save();
			} catch (err) {
				log({ level: LOG.ERROR }, 'resolvers.Mutation.deleteCells Error deleting cells:', err.message);
            return err;
			}
		},

      // TODO should give user the option to delete the whole subsheet also
      /* This is to remove a cell's connection to a subsheet, while preserving the text in the cell from the subsheet */
      deleteSubsheetId: async (parent, args, context) => {
         const { sheetId, row, column, content } = args.input;
			const { formattedText, subsheetId } = content;
         try {
            // remove the subsheetId from the cell which links to it
            const sheetDoc = await SheetModel.findById(sheetId);
            const updatedCells = deleteSubsheetId({ originalCells: sheetDoc.cells, row, column, formattedText });
				sheetDoc.cells = updatedCells;
            sheetDoc.metadata.lastUpdated = new Date();
            await sheetDoc.save();
            
            // remove the reference to the parent from the subsheet
            const subsheetDoc = await SheetModel.findById(subsheetId);
            subsheetDoc.metadata.parentSheetId = null;
				log({ level: LOG.VERBOSE }, 'resolvers--Mutation--deleteSubsheetId removed parentId from subsheet with Id:', subsheetId, 'so its metadata looks like this:', subsheetDoc?.metadata);
            await subsheetDoc.save();

            // return the cell that has had the subsheet unlinked from it
            const cell = findCellByRowAndColumn(row, column, sheetDoc.cells);
            return cell;
         } catch (err) {
            log({ level: LOG.ERROR }, 'resolvers--Mutation--deleteSubsheetId Error deleting subsheet id:', err.message);
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
            log({ level: LOG.ERROR }, 'resolvers.Mutation.deleteSheet Error deleting sheet', err.message);
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
            log({ level: LOG.ERROR }, 'resolvers.Mutation.deleteSheets Error deleting sheets:', err.message);
            return err;
         }
      },

		updateHistory: async (parent, args, context) => {
			try {
				// args.input has all the history fields plus the sheet's id
				const originalHistoryDoc = await HistoryModel.find({ present: { _id: args.sheetId } });

				// put the past, future and actionHistory into the history
				const newHistory = R.mergeAll([
					originalHistoryDoc.toObject(), //toObject() gets rid of any weird props included from mongoose
					R.pick(
						[
							'past',
							'future',
							'actionHistory',
						],
						args.input
					),
				]);

				// if we were given a present, then update that also and update present.metadata.lastUpdated
				const finalHistory = isSomething(args.input.present) 
					? {
						...newHistory,
						present: {
							...args.input.present,
							metadata: {
								...args.input.present.metadata,
								lastUpdated: new Date() 
							}
						},

					}
					: newHistory;

				const finalHistoryDoc = R.mergeLeft(finalHistory, originalHistoryDoc);
            const savedHistory = await finalHistoryDoc.save();
            return savedHistory;
			} catch (err) {
            log({ level: LOG.ERROR }, 'resolvers--Mutation--updateHistory Error updating history:', err.message);
            return err;
         }
		},
   },
});

export default resolvers;