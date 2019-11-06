import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import App from '../../components/App';
import mockSheet from '../../mockSheet';

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

// skipping testing this as first need to test everything under it
describe('App component', () => {
   it('renders the whole thing', () => {
      act(() => {
         ReactDOM.render(
            <Provider store={testStore}>
               <App />
            </Provider>,
            testContainer
         );
      });
      const app = document.querySelector('body div');
      expect(app.innerHTML).toContain(
         '<h2 className="vibrant-blue text">Deep Sheet</h2>'
      );
   });
});
