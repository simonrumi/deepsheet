import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import Row from '../../components/Row';
import mockSheet from '../../mockSheet';
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
      act(() => {
         ReactDOM.render(
            <Provider store={testStore}>
               <Row
                  cells={mockSheet.content[1].content}
                  key={mockSheet.content[1].metadata.row}
               />
            </Provider>,
            testContainer
         );
      });

      // in order to make this into a loop, we'd have to convert the row and column index number in the mocksheet to
      // letter-number combinations like "A2". This would mean using a helper file....so then it seems
      // we are running a test that relies on some functionality that is not being tested here.
      // Instead manually writing out a few lines with the ids we expect.
      let row = document.querySelector('#A2');
      expect(row.innerHTML).toEqual(mockSheet.content[1].content[0].content);
      row = document.querySelector('#B2');
      expect(row.innerHTML).toEqual(mockSheet.content[1].content[1].content);
      row = document.querySelector('#C2');
      expect(row.innerHTML).toEqual(mockSheet.content[1].content[2].content);
      row = document.querySelector('#D2');
      expect(row.innerHTML).toEqual(mockSheet.content[1].content[3].content);
   });
});
