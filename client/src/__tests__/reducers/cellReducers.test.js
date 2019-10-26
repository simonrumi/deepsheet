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
