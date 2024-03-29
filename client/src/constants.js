export const GRAPHQL_URL = '/.netlify/functions/graphql';
export const FACEBOOK_AUTH_URL = '/.netlify/functions/auth?provider=facebook';
export const GOOGLE_AUTH_URL = '/.netlify/functions/auth?provider=google';

export const INVISIBLE_PIXEL = '/img/FFFFFF-0.png'; // not used so far, but keeping just in case

export const ROW_AXIS = 'row';
export const COLUMN_AXIS = 'column';
export const DEFAULT_TOTAL_ROWS = 6;
export const DEFAULT_TOTAL_COLUMNS = 6;
export const THIN_COLUMN = '3em';
export const SPLIT_THIN_COLUMN = '1.05em 1.05em';
export const THIN_ROW = '2em';
export const DEFAULT_COLUMN_WIDTH = '16em';
export const DEFAULT_ROW_HEIGHT = '2.5em';
export const MIN_COLUMN_WIDTH = '50'; // this is in pixels
export const MIN_ROW_HEIGHT = '40'; // this is in pixels..smaller than this means the row resizer can disappear if the row is too small
export const TOOL_ICON_HEIGHT = '2em';
export const TOOL_ICON_WIDTH = '2em';

export const DRAGGABLE_ROW_RESIZER = 'draggable_row_resizer';
export const DRAGGABLE_COLUMN_RESIZER = 'draggable_column_resizer';
export const DRAGGABLE_ROW_NUMBER = 'draggable_row_number';
export const DRAGGABLE_COLUMN_LETTER = 'draggable_column_letter';

export const SORT_INCREASING = 'sort_increasing';
export const SORT_DECREASING = 'sort_decreasing';
export const SORT_TYPE_TEXT = 'sort_type_text';
export const SORT_TYPE_NUMBERS = 'sort_type_numbers';
export const SORT_TYPE_DATES = 'sort_type_dates';

export const LOCAL_STORAGE_STATE_KEY = 'dds_state';
export const LOCAL_STORAGE_ACTION_KEY = 'dds_action';
export const LOCAL_STORAGE_TIME_KEY = 'dds_time';

// these are ro use as the changeType in the hasChangedMetadata action
export const CHANGED_FILTER = 'changed_filter';
export const ORDERED_COLUMN = 'ordered_column';
export const ORDERED_ROW = 'ordered_row';
export const INSERTED_COLUMN = 'inserted_column';
export const INSERTED_ROW = 'inserted_row';

export const ALL_CELLS = 'all_cells'; // for use by cellsNeeding Update

// logging levels
export const LOG = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    HTTP: 3,
    VERBOSE: 4,
    DEBUG: 5,
    SILLY: 6,
}

export const CLIENT_LOG_LEVEL = LOG.WARN;


