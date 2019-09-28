import React from 'react';
import { shallow, mount } from 'enzyme';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import mockSheet from '../../mockSheet';
import Header, { Header as JustHeader } from '../../components/Header';

import { updateTitle } from '../../actions';
import { UPDATE_TITLE } from '../../actions/types';
import { updateTitleReducer } from '../../reducers';

const middleware = [thunk];
const mockStore = configureMockStore(middleware);

describe('Header', () => {
   let testStore = mockStore({ sheet: mockSheet });
   let wrapper;

   beforeEach(() => {
      const mockUserClick = jest.fn();
      wrapper = mount(
         <Provider store={testStore}>
            <Header />
         </Provider>
      );
   });

   afterEach(() => {
      wrapper.unmount();
   });

   it('creates an action to update the title', () => {
      const newTitle = 'New Title';
      const expectedAction = {
         type: UPDATE_TITLE,
         payload: newTitle,
      };
      expect(updateTitle(newTitle)).toEqual(expectedAction);
   });

   describe('updateTitleReducer', () => {
      it('should handle UPDATE_TITLE', () => {
         debugger;
         const newTitle = 'New Title';
         const newSheet = { ...mockSheet };
         newSheet.metadata.title = newTitle;
         expect(
            updateTitleReducer(mockSheet, {
               type: UPDATE_TITLE,
               payload: newSheet,
            })
         ).toEqual(newSheet);
      });
   });

   it('edits the title', () => {
      const shallowWrapper = shallow(<JustHeader {...props} />);
      // QQQ what to do here?
   });

   it('displays the title of the sheet', () => {
      expect(wrapper.find('h2').text()).toEqual(mockSheet.metadata.title);
   });

   it.skip('Allows updating of the title', () => {
      debugger;

      //const spy = jest.spyOn(wrapper.instance(), 'editTitle');
      //wrapper.update();
      const h2Parent = wrapper.find('h2').parent();
      h2Parent.update();
      //h2ParentSpy = jest.spyOn(h2Parent.instance, 'editTitle');
      //h2Parent.update();
      h2Parent.simulate('click');
      //h2Spy = jest.spyOn(h2.instance(), 'editTitle');
      //h2.update();
      //h2.simulate('click');
      //expect(h2Spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();

      //const shallowHeader = shallow(<Header onClick={mockUserClick} />);
      //shallowHeader.find('h2').simulate('click');
      //expect(mockUserClick.mock.calls.length).toBe(1);

      //const titleH2 = wrapper.find('h2'); // trying to see click on parent() threw complex error
      //wrapper.update(); // this can apparently fix issues if the state gets out of whack
      //titleH2.simulate('click');
      //expect(wrapper.instance().editTitle).toHaveBeenCalled();
   });
});
