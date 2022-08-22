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

export const PASTE_OPTIONS_MODAL_WIDTH = parseFloat(getComputedStyle(document.body).fontSize) * 25; //'30em';
export const PASTE_OPTIONS_MODAL_MIN_HEIGHT = parseFloat(getComputedStyle(document.body).fontSize) * 15; // '15em';
export const HISTORY_MODAL_MIN_WIDTH = parseFloat(getComputedStyle(document.body).fontSize) * 15;
export const HISTORY_MODAL_MIN_HEIGHT = parseFloat(getComputedStyle(document.body).fontSize) * 15;

export const SORT_INCREASING = 'sort_increasing';
export const SORT_DECREASING = 'sort_decreasing';
export const SORT_TYPE_TEXT = 'sort_type_text';
export const SORT_TYPE_NUMBERS = 'sort_type_numbers';
export const SORT_TYPE_DATES = 'sort_type_dates';

export const LOCAL_STORAGE_STATE_KEY = 'dds_state';
export const LOCAL_STORAGE_ACTION_KEY = 'dds_action';
export const LOCAL_STORAGE_TIME_KEY = 'dds_time';

export const ALL_CELLS = 'all_cells'; // for use by cellsNeeding Update

/** Rich text editing **/
export const BLOCK_SEPARATOR = '<br>';
export const BLOCK_SEPARATOR_REGEX = /<br>$/;
export const NEWLINE_REGEX = /(?:\n\r|\r\n|\n|\r)/g;
export const BLOCK_END_CHAR_LENGTH = 1; // this is the length of the '\n' char at the end of each line
export const BOLD = 'BOLD';
export const ITALIC = 'ITALIC';
export const UNDERLINE = 'UNDERLINE';

export const STYLE_TAGS = {
	[BOLD]: 'font-bold',
	[ITALIC]: 'italic',
	[UNDERLINE]: 'underline'
}

export const CELL_EDITOR_ESC = 'cell-editor-esc';
export const CELL_EDITOR_ENTER = 'cell-editor-enter';
export const CELL_EDITOR_ALT_ENTER = 'split-block'; // specific string required by Draft.js 
export const CELL_EDITOR_TAB = 'cell-editor-tab';
export const CELL_EDITOR_SHIFT_TAB = 'cell-editor-shift-tab';
export const CELL_EDITOR_COPY = 'cell-editor-copy';
export const CELL_EDITOR_PASTE = 'cell-editor-paste';
export const CELL_EDITOR_KEY_COMMAND_HANDLED = 'handled'; // specific string required by Draft.js 
export const CELL_EDITOR_KEY_COMMAND_NOT_HANDLED = 'not-handled'; // specific string required by Draft.js 

/** logging levels **/
export const LOG = {
	ERROR: 0,
	WARN: 1,
	INFO: 2,
	HTTP: 3,
	VERBOSE: 4,
	DEBUG: 5,
	SILLY: 6,
}

const getLogLevel = () => {
	const logQueryStrValue = document.location.search.match(/log=(\w*)/i);
	if (!logQueryStrValue) {
		return LOG.ERROR;
	}
	switch (logQueryStrValue[1]) {
		case 'error':
			return LOG.ERROR;

		case 'warn':
			return LOG.WARN;

		case 'info':
			return LOG.INFO;

		case 'http':
			return LOG.HTTP;

		case 'verbose':
			return LOG.VERBOSE;

		case 'debug':
			return LOG.DEBUG;

		case 'silly':
			return LOG.SILLY;

		default:
			return LOG.ERROR;
	}
}

export const CLIENT_LOG_LEVEL = getLogLevel(); //LOG.DEBUG;


