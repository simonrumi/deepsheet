import React from 'react';
import { shallow, mount } from 'enzyme';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import Editor from '../../components/Editor';
import Row from '../../components/Row'; // need a Row of Cells to edit
import ErrorBoundary from '../../components/ErrorBoundary';
import mockSheet from '../../mockSheet';

/// QQQQ do we use act() or the wrapper thing below? need to google
//import { act } from 'react-dom/test-utils';

// see https://levelup.gitconnected.com/the-basics-of-testing-a-react-component-2ff635c99044
// This chunk of code should be in a setupTests.js file the /src folder,
// which is then applied globally to all tests,
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

const middleware = [thunk];
const mockStore = configureMockStore(middleware);

describe('Editor', () => {
   let wrapper;
   let mockUserAction;
   let testContainer;
   let testStore;

   beforeEach(async () => {
      testContainer = document.createElement('div');
      document.body.appendChild(testContainer);
      testStore = mockStore({ sheet: mockSheet });
      debugger;
      mockUserAction = jest.fn();
      wrapper = await mount(
         <Provider store={testStore}>
            <Editor change={mockUserAction} />
            <Row
               cells={mockSheet.content[0].content}
               key={mockSheet.content[0].metadata.row}
            />
         </Provider>
      );
      debugger;
   });

   afterEach(() => {
      ReactDOM.unmountComponentAtNode(testContainer);
      testContainer.remove();
      testContainer = null;
   });

   it.skip('should display the text of the cell that was clicked', async () => {
      debugger;

      //testStore = mockStore({ sheet: mockSheet });
      //mockUserAction = jest.fn();
      /*wrapper = await mount(
         <Provider store={localTestStore}>
            <Editor change={localMockUserAction} />
            <Row
               cells={mockSheet.content[0].content}
               key={mockSheet.content[0].metadata.row}
            />
         </Provider>
      );*/

      debugger;
      wrapper.find('#A1').simulate('click');
      expect(wrapper.find('.ql-editor > p').innerText).toEqual(
         mockSheet.content[0].content[0]
      );
   });

   it.skip('should match the snapshot', () => {
      expect(wrapper).toMatchSnapshot();
   });
});
