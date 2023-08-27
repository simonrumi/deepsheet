const R = require('ramda');
const expect = require('chai').expect;
const sinon = require('sinon');
// need to require SheetModel before requiring sheetHelpers
const mongoose = require('mongoose');
require('../../models/SheetModel');
const { createNewSheet, getAllSheets } = require('../../helpers/sheetHelpers');
const { DEFAULT_ROWS, DEFAULT_COLUMNS, DEFAULT_TITLE, DEFAULT_SUMMARY_CELL } = require('../../constants');

const getSpecificCellFromSheet = ({ sheet, row, column }) =>
   R.reduce(
      (accumulator, cell) => {
         if (cell.row === row && cell.column === column) {
            return cell;
         }
         return accumulator;
      },
      null,
      sheet.cells
   );

describe('Sheet Helpers', () => {
   const rows = 5;
   const columns = 7;
   const title = 'a specific title';
   const parentSheetId = '456xyz';
   const summaryCell = { row: 3, column: 4 };
   const summaryCellText = 'the summary cell';
   const userId = '123abc';

   it('createNewSheet makes a new sheet with all specific parameters passed', () => {
      const sheet = createNewSheet({ rows, columns, title, parentSheetId, summaryCell, summaryCellText, userId });
      expect(sheet.metadata.totalRows).to.equal(rows);
      expect(sheet.metadata.totalColumns).to.equal(columns);
      expect(sheet.metadata.parentSheetId).to.equal(parentSheetId);
      expect(sheet.metadata.summaryCell).to.deep.equal(summaryCell);
      expect(sheet.cells.length).to.equal(rows * columns);
      expect(sheet.title).to.equal(title);
      expect(sheet.users.owner).to.equal(userId);

      const sheetSummaryCell = getSpecificCellFromSheet({ ...summaryCell, sheet });
      expect(sheetSummaryCell.content.text).to.equal(summaryCellText);
   });

   it('createNewSheet makes a new sheet with all specific parameters except totalRows & totalColumns passed', () => {
      const sheet = createNewSheet({ title, parentSheetId, summaryCell, summaryCellText, userId });
      expect(sheet.metadata.totalRows).to.equal(DEFAULT_ROWS);
      expect(sheet.metadata.totalColumns).to.equal(DEFAULT_COLUMNS);
      expect(sheet.metadata.parentSheetId).to.equal(parentSheetId);
      expect(sheet.metadata.summaryCell).to.deep.equal(summaryCell);
      expect(sheet.cells.length).to.equal(DEFAULT_ROWS * DEFAULT_COLUMNS);
      expect(sheet.title).to.equal(title);
      expect(sheet.users.owner).to.equal(userId);
   });

   it('createNewSheet makes a new sheet with all specific parameters except parentSheetId passed', () => {
      const sheet = createNewSheet({ rows, columns, title, summaryCell, summaryCellText, userId });
      expect(sheet.metadata.totalRows).to.equal(rows);
      expect(sheet.metadata.totalColumns).to.equal(columns);
      expect(sheet.metadata.parentSheetId).to.equal(null);
      expect(sheet.metadata.summaryCell).to.deep.equal(summaryCell);
      expect(sheet.cells.length).to.equal(rows * columns);
      expect(sheet.title).to.equal(title);
      expect(sheet.users.owner).to.equal(userId);
   });

   it('createNewSheet makes a new sheet with defaults when only userId is passed', () => {
      const sheet = createNewSheet({ userId });
      expect(sheet.metadata.totalRows).to.equal(DEFAULT_ROWS);
      expect(sheet.metadata.totalColumns).to.equal(DEFAULT_COLUMNS);
      expect(sheet.metadata.parentSheetId).to.equal(null);
      expect(sheet.metadata.summaryCell).to.deep.equal(DEFAULT_SUMMARY_CELL);
      expect(sheet.cells.length).to.equal(DEFAULT_ROWS * DEFAULT_COLUMNS);
      expect(sheet.title).to.equal(DEFAULT_TITLE);
      expect(sheet.users.owner).to.equal(userId);
   });

   it('createNewSheet makes a new sheet with zero columns and zero rows', () => {
      const sheet = createNewSheet({ userId, rows: 0, columns: 0 });
      expect(sheet.metadata.totalRows).to.equal(0);
      expect(sheet.metadata.totalColumns).to.equal(0);
      expect(sheet.metadata.parentSheetId).to.equal(null);
      expect(sheet.metadata.summaryCell).to.deep.equal(DEFAULT_SUMMARY_CELL);
      expect(sheet.cells.length).to.equal(0);
      expect(sheet.title).to.equal(DEFAULT_TITLE);
      expect(sheet.users.owner).to.equal(userId);
   });

   it('createNewSheet without a userId throws an error', () => {
      expect(() => createNewSheet({ rows, columns, title, summaryCell, summaryCellText })).to.throw();
   });

   // for demonstrating createSubInstance below
   class FooThing {
      constructor() {
         this.foo = 'bar';
      }
      subFn() {
         return 'you called the sub function';
      }
   }

   it('demonstration of using createStubInstance', () => {
      const fooThingStubInstance = sinon.createStubInstance(FooThing);
      fooThingStubInstance.subFn.returns('subFn was not really called');
      expect(fooThingStubInstance.subFn()).to.equal('subFn was not really called');
      sinon.assert.calledOnce(fooThingStubInstance.subFn);
      fooThingStubInstance.subFn.restore(); // should do this every time
   });

   it('getAllSheets', async () => {
      const SheetModel = mongoose.model('sheet');
      const dummySheets = [{ sheetId: 1 }, { sheetId: 2 }];

      // note that this version doesn't work - seems like sheetModelStubInstance doesn't have a .find() function
      // const sheetModelStubInstance = sinon.createStubInstance(SheetModel);
      // sheetModelStubInstance.find.returns(dummySheets);
      // sinon.assert.calledOnce(sheetModelStubInstance.find);
      // expect(sheetModelStubInstance.find()).to.equal(dummySheets);

      const sheetModelFind = sinon.stub(SheetModel, 'find');
      sheetModelFind.returns(dummySheets);
      const allSheets = await getAllSheets();
      sinon.assert.calledOnce(sheetModelFind);
      expect(allSheets).to.equal(dummySheets);
      sheetModelFind.restore(); // should do this every time
   });
});
