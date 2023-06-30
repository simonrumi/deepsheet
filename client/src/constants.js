export const GRAPHQL_URL = '/.netlify/functions/graphql';
export const FACEBOOK_AUTH_URL = '/.netlify/functions/auth?provider=facebook';
export const GOOGLE_AUTH_URL = '/.netlify/functions/auth?provider=google';

export const INVISIBLE_PIXEL = '/img/FFFFFF-0.png'; // not used so far, but keeping just in case

export const ROW_AXIS = 'row';
export const COLUMN_AXIS = 'column';
export const DEFAULT_TOTAL_ROWS = 3;
export const DEFAULT_TOTAL_COLUMNS = 2;
export const THIN_COLUMN = '4em';
export const SPLIT_THIN_COLUMN = '1.05em 1.05em';
export const THIN_ROW = '2em';
export const DEFAULT_COLUMN_WIDTH = '16em';
export const DEFAULT_ROW_HEIGHT = '2.5em';
export const MIN_COLUMN_WIDTH = '50'; // this is in pixels
export const MIN_ROW_HEIGHT = '40'; // this is in pixels..smaller than this means the row resizer can disappear if the row is too small
export const TOOL_ICON_HEIGHT = '2em';
export const TOOL_ICON_WIDTH = '2em';

export const PASTE_OPTIONS_MODAL_WIDTH = parseFloat(getComputedStyle(document.body).fontSize) * 25; //'25em';
export const PASTE_OPTIONS_MODAL_MIN_HEIGHT = parseFloat(getComputedStyle(document.body).fontSize) * 15; // '15em';
export const HISTORY_MODAL_MIN_WIDTH = parseFloat(getComputedStyle(document.body).fontSize) * 15;
export const HISTORY_MODAL_MIN_HEIGHT = parseFloat(getComputedStyle(document.body).fontSize) * 15;

export const CELL_EDITOR_HORIZONTAL_MARGIN = -30; // pixels
export const CELL_EDITOR_VERTICAL_PADDING = 40; // pixels
export const CELL_EDITOR_LINE_HEIGHT = 80; //pixels
export const CELL_EDITOR_VERTICAL_MARGIN = -1 * CELL_EDITOR_LINE_HEIGHT - 5; // pixels

export const CELL_EDITOR_TOOLS_LEFT_OFFSET = -60; // pixels
export const CELL_EDITOR_TOOLS_TOP_OFFSET = -1 * CELL_EDITOR_VERTICAL_MARGIN - 55; // pixels

export const FLOATING_CELL_TOP_OFFSET = 20; //pixels
export const FLOATING_CELL_LEFT_OFFSET = 20; //pixels
export const ADD_FLOATING_CELL_BTN_WIDTH = 50; // pixels - this is approximate, as it is changeable with screensize
export const FLOATING_CELL = 'floating_cell'; // used to indicate the type of element to DraggableElement

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

export const MAX_UNDO_STEPS = 20;

// floating cell stuff
export const DEFAULT_FLOATING_CELL_TEXT = 'new floating cell';

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


