import {
   removePTags,
   indexToColumnLetter,
   indexToRowNumber,
   cellReducerFactory,
   createCellReducers,
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

describe('cellReducers', () => {
   const row = 1;
   const col = 2;
   const state = {
      metadata: {
         row: row,
         column: col,
      },
      content: 'original cell content',
   };
   const actionType = 'update_cell_' + row + '_' + col;
   const newContent = 'some new cell content';
   let action;

   beforeEach(() => {
      action = {
         type: actionType,
         payload: { ...state, content: newContent },
      };
   });

   it('cellReducerFactory should return a function to update a specific cell, given the row & col numbers', () => {
      const cellFn = cellReducerFactory(row, col);
      expect(cellFn(state, action).content).toEqual(newContent);
   });

   it('createCellReducers should return an object of cell reducer functions', () => {
      const totalRows = 4;
      const totalCols = 5;
      const cellReducers = createCellReducers(totalRows, totalCols);
      expect(cellReducers.cell_3_4 instanceof Function).toBe(true);
      expect(cellReducers.cell_1_2(state, action).content).toEqual(newContent);
   });
});
