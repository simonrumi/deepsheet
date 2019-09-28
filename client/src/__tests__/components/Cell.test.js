import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import Cell from '../../components/Cell';
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

describe('Cell component', () => {
   it('shows the expected content', () => {
      act(() => {
         ReactDOM.render(
            <Provider store={testStore}>
               <Cell
                  row={1}
                  column={1}
                  isLastColumn={false}
                  isLastRow={false}
               />
            </Provider>,
            testContainer
         );
      });
      const cell = document.querySelector('#B2');
      expect(cell.innerHTML).toEqual(mockSheet.content[1].content[1].content);
   });
});
