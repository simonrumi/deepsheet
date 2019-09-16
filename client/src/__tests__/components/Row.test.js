import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import Row from '../../components/Row';
import mockSheet from '../../actions/mockSheet';
//import { create } from 'react-test-renderer';

const middleware = [thunk];
const mockStore = configureMockStore(middleware);
let testContainer;
let testStore;

beforeEach(() => {
	testContainer = document.createElement('div');
	document.body.appendChild(testContainer);
	testStore = mockStore({ sheet: mockSheet });
});

afterEach(() => {
	ReactDOM.unmountComponentAtNode(testContainer);
	testContainer.remove();
	testContainer = null;
});

describe('Row component', () => {
	it('shows the expected content', () => {
		console.log('trying to display row:', mockSheet.content[1].content);
		act(() => {
			ReactDOM.render(
				<Provider store={testStore}>
					<Row cells={mockSheet.content[1].content} key={mockSheet.content[1].metadata.row} />
				</Provider>,
				testContainer
			);
		});
		// TODO make this a loop
		let row = document.querySelector('#B1');
		expect(row.innerHTML).toEqual(mockSheet.content[1].content[0].content);
		row = document.querySelector('#B2');
		expect(row.innerHTML).toEqual(mockSheet.content[1].content[1].content);
		row = document.querySelector('#B3');
		expect(row.innerHTML).toEqual(mockSheet.content[1].content[2].content);
	});
});
