module.exports = {
   metadata: {
      type: 'sheet',
      title: 'Mock Sheet',
      totalRows: 3,
      totalColumns: 4,
   },
   content: [
      {
         metadata: {
            type: 'row',
            row: 0,
            column: undefined,
         },
         content: [
            {
               metadata: {
                  type: 'cell',
                  row: 0,
                  column: 0,
               },
               content: 'this',
            },
            {
               metadata: {
                  type: 'cell',
                  row: 0,
                  column: 1,
               },
               content: 'is',
            },
            {
               metadata: {
                  type: 'cell',
                  row: 0,
                  column: 2,
               },
               content: 'the',
            },
            {
               metadata: {
                  type: 'cell',
                  row: 0,
                  column: 3,
               },
               content: 'final',
            },
         ],
      }, // end  row

      {
         metadata: {
            type: 'row',
            row: 1,
            column: undefined,
         },
         content: [
            {
               metadata: {
                  type: 'cell',
                  row: 1,
                  column: 0,
               },
               content: 'test',
            },
            {
               metadata: {
                  type: 'cell',
                  row: 1,
                  column: 1,
               },
               content: 'data',
            },
            {
               metadata: {
                  type: 'cell',
                  row: 1,
                  column: 2,
               },
               content: 'of',
            },
            {
               metadata: {
                  type: 'cell',
                  row: 1,
                  column: 3,
               },
               content: 'the whole of',
            },
         ],
      }, // end  row

      {
         metadata: {
            type: 'row',
            row: 2,
            column: undefined,
         },
         content: [
            {
               metadata: {
                  type: 'cell',
                  row: 2,
                  column: 0,
               },
               content: 'the',
            },
            {
               metadata: {
                  type: 'cell',
                  row: 2,
                  column: 1,
               },
               content: 'test',
            },
            {
               metadata: {
                  type: 'cell',
                  row: 2,
                  column: 2,
               },
               content: 'sheet',
            },
            {
               metadata: {
                  type: 'cell',
                  row: 2,
                  column: 3,
               },
               content: 'of mine',
            },
         ],
      }, // end  row
   ], // end  sheet content
};
