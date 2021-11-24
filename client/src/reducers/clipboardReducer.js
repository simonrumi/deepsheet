import { UPDATED_CLIPBOARD, UPDATED_CLIPBOARD_ERROR, CLEARED_CLIPBOARD } from '../actions/clipboardTypes';

const clipboardReducer = (state = null, action) => {
    switch (action.type) {
        case UPDATED_CLIPBOARD:
            console.log('clipboardReducer--UPDATED_CLIPBOARD got action.payload', action.payload);
            return action.payload;

        case UPDATED_CLIPBOARD_ERROR:
            console.log('clipboardReducer--UPDATED_CLIPBOARD_ERROR got action.payload', action.payload);
            return { ...state, error: action.payload }

			case CLEARED_CLIPBOARD:
				console.log('clipboardReducer--CLEARED_CLIPBOARD');
            return { text: null }

        default:
            return state;
    }
}

export default clipboardReducer;