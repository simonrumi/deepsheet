import { createReducerManager } from '../../reducers/reducerManager';
import { staticReducers } from '../../reducers';
import { FETCHED_SHEET } from '../../actions/types';
import mockSheet from '../../mockSheet2';

describe('reducerManager', () => {
   const reducerManager = createReducerManager(staticReducers);

   describe('reduce', () => {
      it('returns the correctly updated state after any action, such as FETCHED_SHEET, is passed to it', () => {
         const state = { sheet: {}, title: '' };
         const fetchedSheetAction = {
            type: FETCHED_SHEET,
            payload: mockSheet,
         };
         const newState = reducerManager.reduce(state, fetchedSheetAction);
         expect(newState.sheet).toEqual(mockSheet.metadata);
         expect(newState.title.text).toEqual(mockSheet.title);
      });

      it('returns the state unchanged when an unrecognized action is passed to it', () => {
         const state = { sheet: {}, title: '' };
         const newState = reducerManager.reduce(state, {
            type: undefined,
            payload: null,
         });
         expect(newState.sheet).toEqual(state.sheet);
         expect(newState.title).toEqual(state.title);
      });
   });
   describe('add and remove', () => {
      let state = { sheet: {}, title: '' };
      const dummyKey = 'dummy';
      const specialKey = 'special';
      const dummyReducer = (state = {}, action) => {
         switch (action.type) {
            case 'dummy':
               return action.payload;
            default:
               return state;
         }
      };
      const specialReducer = (state = {}, action) => {
         switch (action.type) {
            case 'special':
               return action.payload;
            default:
               return state;
         }
      };

      const dummyAction = {
         type: 'dummy',
         payload: 'dummy data',
      };
      const specialAction = {
         type: 'special',
         payload: 'special data',
      };

      describe('add', () => {
         it('adds a new reducer with the given key', () => {
            reducerManager.add(dummyKey, dummyReducer);
            state = reducerManager.reduce(state, dummyAction);
            expect(state[dummyKey]).toBe('dummy data');
         });
      });

      describe('remove', () => {
         it('removes a reducer with the given key', () => {
            reducerManager.remove(dummyKey);
            state = reducerManager.reduce(state, {});
            expect(state[dummyKey]).not.toBeDefined();
         });
      });

      describe('addMany', () => {
         it('adds multiple reducers', () => {
            const manyReducers = {
               special: specialReducer,
               dummy: dummyReducer,
            };
            expect(state[dummyKey]).not.toBeDefined();
            expect(state[specialKey]).not.toBeDefined();
            reducerManager.addMany(manyReducers);
            state = reducerManager.reduce(state, specialAction);
            expect(state[specialKey]).toBe('special data');
            state = reducerManager.reduce(state, dummyAction);
            expect(state[dummyKey]).toBe('dummy data');
         });
      });

      describe('removeMany', () => {
         it('removes multiple reducers', () => {
            const keys = [dummyKey, specialKey];
            expect(state[dummyKey]).toBeDefined();
            expect(state[specialKey]).toBeDefined();
            reducerManager.removeMany(keys);
            state = reducerManager.reduce(state, {});
            expect(state[dummyKey]).not.toBeDefined();
            expect(state[specialKey]).not.toBeDefined();
         });
      });
   });
});
