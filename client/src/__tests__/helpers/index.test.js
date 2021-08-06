import {
   indexToColumnLetter,
   indexToRowNumber,
} from '../../helpers';

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