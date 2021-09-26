import { UPDATED_INFO_MODAL_VISIBILITY, UPDATED_INFO_MODAL_CONTENT } from '../actions/infoModalTypes';

const globalInfoModalReducer = (state = {}, action) => {
	switch (action.type) {
		case UPDATED_INFO_MODAL_VISIBILITY:
			// action.payload === true or false
			return action.payload
				? { ...state, isVisible: true }
				: { ...state, content: null, isVisible: false };

		case UPDATED_INFO_MODAL_CONTENT:
			return { ...state, content: action.payload };
		
		default:
			return state;
	}

}

export default globalInfoModalReducer