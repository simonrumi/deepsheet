import managedStore from '../../store';
import * as Actions from '../../actions';
import mockSheet from '../../mockSheet2.js';
import {
   removePTags,
   indexToColumnLetter,
   indexToRowNumber,
   fetchSheet,
   fetchSummaryCellFromSheet,
   extractRowColFromString,
   loadSheet,
} from '../../helpers';

describe('removePTags', () => {
   it('removes P tags from a string', () => {
      const str = '<p>this is a typical string surrounded in p tags</p>';
      expect(removePTags(str)).toEqual(
         'this is a typical string surrounded in p tags'
      );
   });
});

describe('indexToColumnLetter', () => {
   it('converts 0 into "A"', () => {
      const index = 0;
      expect(indexToColumnLetter(index)).toEqual('A');
   });
   it('converts 25 into "Z"', () => {
      const index = 25;
      expect(indexToColumnLetter(index)).toEqual('Z');
   });
   it('converts 26 into "AA"', () => {
      const index = 26;
      expect(indexToColumnLetter(index)).toEqual('AA');
   });
   it('converts 51 into "AZ"', () => {
      const index = 51;
      expect(indexToColumnLetter(index)).toEqual('AZ');
   });
   it('converts 55 into "BD"', () => {
      const index = 26 * 2 + 4 - 1;
      expect(indexToColumnLetter(index)).toEqual('BD');
   });
   it('converts 701 into "ZZ"', () => {
      const index = 26 * 26 + 25;
      expect(indexToColumnLetter(index)).toEqual('ZZ');
   });
});

describe('indexToRowNumber', () => {
   it('converts 0 into 1', () => {
      const index = 0;
      expect(indexToRowNumber(index)).toEqual(1);
   });
   it('converts 25 into 26', () => {
      const index = 25;
      expect(indexToRowNumber(index)).toEqual(26);
   });
});

describe('fectchSheet', () => {
   it('returns the mockSheet given the id of 1', () => {
      expect(fetchSheet(1)).toEqual(mockSheet);
   });
});

describe('fetchSummaryCellFromSheet', () => {
   it('fetches the content of a summary cell given the id of a sheet', () => {
      expect(fetchSummaryCellFromSheet(2)).toEqual(
         'summary of sheet with id 2'
      );
   });
});

describe('extractRowColFromString', () => {
   it('extracts the row and column numbers from a cellKey string like cell_2_3', () => {
      expect(extractRowColFromString('cell_2_3').row).toEqual(2);
      expect(extractRowColFromString('cell_2_3').col).toEqual(3);
   });

   it('extracts the row and column numbers from any string ending like _2_3', () => {
      expect(extractRowColFromString('anyprefixhere_2_3').row).toEqual(2);
      expect(extractRowColFromString('any_preFix_HERE_2_3').col).toEqual(3);
   });
});

describe('loadSheet', () => {
   beforeAll(() => {
      managedStore.init();
   });

   it('calls updatedSheetId', () => {
      const updatedSheetIdSpy = jest.spyOn(Actions, 'updatedSheetId');
      loadSheet(1);
      expect(updatedSheetIdSpy).toHaveBeenCalled();
   });

   it('calls replaceReducer', () => {
      const replaceReducerSpy = jest.spyOn(
         managedStore.store,
         'replaceReducer'
      );
      loadSheet(1); // 1 is the sheetId of the mock sheet
      expect(replaceReducerSpy).toHaveBeenCalled();
   });

   it('loads the sheet into the store', () => {
      loadSheet(mockSheet.metadata._id); // 1 is the sheetId of the mock sheet with 3 rows and 4 cols
      expect(managedStore.state.sheet.totalRows).toEqual(
         mockSheet.metadata.totalRows
      );
      expect(managedStore.state.sheet.totalColumns).toEqual(
         mockSheet.metadata.totalColumns
      );
   });

   it.skip('returns a default, blank sheet if the sheetId is invalid', () => {
      loadSheet();
      expect(managedStore.state.sheet.totalRows).toEqual(20); // need to make default sheet for this to work
   });
});
