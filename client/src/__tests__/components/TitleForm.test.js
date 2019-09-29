import React from 'react';
import { mount } from 'enzyme';
import { reducer as formReducer } from 'redux-form';
import { createStore, combineReducers, compose } from 'redux';
import reduxThunk from 'redux-thunk'; // will need this when making async calls in actions
import { Provider } from 'react-redux';
import TitleForm from '../../components/TitleForm';
import { updateTitle, setEditingTitle } from '../../actions';
import { titleReducer, reduxFormReducer } from '../../reducers';
import { UPDATE_TITLE, SET_EDITING_TITLE } from '../../actions/types.js';
import mockSheet from '../../mockSheet';

describe('TitleForm actions', () => {
	it('creates an action to set the editingTitle state', () => {
		const isEditingTitle = true;
		const expectedAction = {
			type: SET_EDITING_TITLE,
			payload: isEditingTitle,
		};
		expect(setEditingTitle(isEditingTitle)).toEqual(expectedAction);
	});

	it('creates an action to set the update the title', () => {
		const sheetWithUpdatedTitle = { ...mockSheet };
		sheetWithUpdatedTitle.metadata.title = 'title has been replaced';
		const expectedAction = {
			type: UPDATE_TITLE,
			payload: sheetWithUpdatedTitle,
		};
		expect(updateTitle(sheetWithUpdatedTitle)).toEqual(expectedAction);
	});
});

describe('TitleForm reducers', () => {
	it('returns the default state of {}', () => {
		expect(updateTitleReducer(undefined, {})).toEqual({});
	});

	it('returns the default state of isEditingTitle = false', () => {
		expect(titleReducer(undefined, {})).toEqual({
			isEditingTitle: false,
		});
	});

	it('handles a SET_EDITING_TITLE action', () => {
		const isEditingTitle = true;
		expect(
			setEditingTitleReducer(undefined, {
				type: SET_EDITING_TITLE,
				payload: isEditingTitle,
			})
		).toEqual({
			isEditingTitle,
		});
	});

	it('handles an UPDATE_TITLE action', () => {
		const sheetWithUpdatedTitle = { ...mockSheet };
		sheetWithUpdatedTitle.metadata.title = 'title has been replaced';
		expect(
			updateTitleReducer(mockSheet, {
				type: UPDATE_TITLE,
				payload: sheetWithUpdatedTitle,
			})
		).toEqual(sheetWithUpdatedTitle);
	});
});

describe('TitleForm component', () => {
	const setup = () => {
		const props = {
			title: 'Original Title',
		};
		const reducers = combineReducers({
			title: updateTitleReducer,
			titleEditor: setEditingTitleReducer,
			form: reduxFormReducer,
		});
		const enzymeWrapper = mount(
			<Provider store={createStore(reducers, compose(applyMiddleware(reduxThunk)))}>
				<TitleForm {...props} />
			</Provider>
		);
		return { props, enzymeWrapper };
	};

	it('should render the title editing form', () => {
		const { props, enzymeWrapper } = setup();
		debugger;
		expect(enzymeWrapper.find('form').length).toEqual(1);
		expect(enzymeWrapper.find('form').props().className).toEqual('ui form error');
		expect(enzymeWrapper.find('form').props().children.props.children.length).toBeGreaterThan(0);
		expect(enzymeWrapper.find('input').props().name).toEqual('title');
		expect(enzymeWrapper.find('input').props().value).toEqual(props.title);
		//other enzylemWrapper input props() are:
		// type // 'input' but we know that anyway since we searched for 'input'
		// onBlur()
		// onChange()
		// onDragStart()
		// onDrop()
		// onFocus()
	});
});
