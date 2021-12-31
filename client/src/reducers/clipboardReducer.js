import { UPDATED_CLIPBOARD, UPDATED_CLIPBOARD_ERROR, CLEARED_CLIPBOARD } from '../actions/clipboardTypes';

const clipboardReducer = (state = null, action) => {
    switch (action.type) {
        case UPDATED_CLIPBOARD:
            return action.payload;

        case UPDATED_CLIPBOARD_ERROR:
            return { ...state, error: action.payload }

			case CLEARED_CLIPBOARD:
            return { text: null }

        default:
            return state;
    }
}

export default clipboardReducer;