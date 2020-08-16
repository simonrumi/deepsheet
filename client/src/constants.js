export const DEFAULT_SHEET_ID = null; // expecting to trigger making a new sheet //'5ef8d279e80b425d0863c709'; // used by UPDATED_SHEET_ID

// SERVER_URL doesn't seem to be used
export const SERVER_URL =
   process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://stupefied-lamarr-20c8d9.netlify.app/';

export const GRAPHQL_URL =
   process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000/graphql'
      : 'https://stupefied-lamarr-20c8d9.netlify.app/graphql';

console.log('remember to update GRAPHQL_URL in client/src/constants.js when changing domain');

export const ROW_AXIS = 'row';
export const COLUMN_AXIS = 'column';

export const THIN_COLUMN = '2.1em';
export const SPLIT_THIN_COLUMN = '1.05em 1.05em';
export const ROW_HEIGHT = '2em';

export const ItemTypes = {
   DRAGGABLE_ROW_HEADER: 'draggable_row_header',
   DRAGGABLE_COLUMN_HEADER: 'draggable_column_header',
};

export const SORT_INCREASING = 'sort_increasing';
export const SORT_DECREASING = 'sort_decreasing';
