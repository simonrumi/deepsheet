import { UPDATED_CLIPBOARD, UPDATED_CLIPBOARD_ERROR } from '../actions/clipboardTypes';

const clipboardReducer = (state = null, action) => {
    switch (action.type) {
        case UPDATED_CLIPBOARD:
            console.log('clipboardReducer--UPDATED_CLIPBOARD got action.payload', action.payload);
            return action.payload;

        case UPDATED_CLIPBOARD_ERROR:
            console.log('clipboardReducer--UPDATED_CLIPBOARD_ERROR got action.payload', action.payload);
            return { ...state, error: action.payload }

        default:
            return state;
    }
}

export default clipboardReducer;