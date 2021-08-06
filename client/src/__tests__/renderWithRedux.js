// original from Kent Dodd
// https://codesandbox.io/s/github/kentcdodds/react-testing-library-examples/tree/master/?fontsize=14&module=%2Fsrc%2F__tests__%2Freact-redux.js&previewwindow=tests
/* import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import managedStore from '../store';
import { fetchedSheet } from '../actions';

export default (uiElement, mockSheet) => {
   managedStore.init();
   managedStore.store.dispatch(fetchedSheet(mockSheet));
   const queryObject = render(
      <Provider store={managedStore.store}>{uiElement}</Provider>
   );
   return queryObject;
}; */

describe('renderWithRedux', () => {
   it('hello world test', () => {
      expect(true).toBe(true);
   })
});
