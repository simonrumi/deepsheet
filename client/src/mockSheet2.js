module.exports = {
   metadata: {
      _id: 1,
      totalRows: 3,
      totalColumns: 4,
      parentSheetId: null,
      columnVisibility: [
         { index: 0, isVisible: true },
         { index: 1, isVisible: true },
         { index: 2, isVisible: false },
         { index: 3, isVisible: true },
      ],
      rowVisibility: {},
      columnFilters: {},
      rowFilters: {},
   },
   title: 'My Deep Deep Sheet',
   rows: [
      {
         row: 0,
         columns: [
            {
               row: 0,
               column: 0,
               content:
                  'this is some longer content to see what happens with it',
               visible: true,
            },
            {
               row: 0,
               column: 1,
               content: 'is',
               visible: true,
            },
            {
               row: 0,
               column: 2,
               content: 'the',
               visible: true,
            },
            {
               row: 0,
               column: 3,
               content: { _id: 2 },
               visible: true,
            },
         ],
      }, // end  row
      {
         row: 1,
         columns: [
            {
               row: 1,
               column: 0,
               content: 'test',
               visible: true,
            },
            {
               row: 1,
               column: 1,
               content: 'data',
               visible: true,
            },
            {
               row: 1,
               column: 2,
               content: 'of',
               visible: true,
            },
            {
               row: 1,
               column: 3,
               content: 'the whole of',
               visible: true,
            },
         ],
      }, // end  row
      {
         row: 2,
         columns: [
            {
               row: 2,
               column: 0,
               content: 'the',
               visible: true,
            },
            {
               row: 2,
               column: 1,
               content: 'test',
               visible: true,
            },
            {
               row: 2,
               column: 2,
               content: 'sheet',
               visible: true,
            },
            {
               row: 2,
               column: 3,
               content: 'of mine',
               visible: true,
            },
         ],
      }, // end  row
   ], // end  rows
};
