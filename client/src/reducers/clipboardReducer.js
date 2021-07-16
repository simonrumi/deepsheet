import { UPDATED_CLIPBOARD } from '../actions/clipboardTypes';

const clipboardReducer = (state = null, action) => {
    switch (action.type) {
        case UPDATED_CLIPBOARD:
            return action.payload;

        default:
            return state;
    }
}

export default clipboardReducer;