import React from 'react';
import { fireEvent } from '@testing-library/react';
import TitleForm from '../../components/TitleForm';
import mockSheet from '../../mockSubSheet';
import renderWithRedux from '../renderWithRedux';
import managedStore from '../../store';
import { loadSheet } from '../../helpers';

describe('TitleForm', () => {
   let queries, titleSubmit, titleInput;

   beforeEach(() => {
      managedStore.init();
      loadSheet(mockSheet.metadata._id);
      queries = renderWithRedux(
         <TitleForm title={mockSheet.title} />,
         mockSheet
      );
      titleInput = queries.getByTestId('titleInput');
      titleSubmit = queries.getByTestId('titleSubmit');
   });

   it('should display the edit title form with the current title loaded', () => {
      expect(queries.getByTestId('titleForm')).not.toBe(null);
      expect(titleInput.value).toEqual(mockSheet.title);
   });

   it('should update the title input when new characters are typed', () => {
      // note: event names are here
      // https://github.com/testing-library/dom-testing-library/blob/master/src/events.js
      const newTitle = 'new title';
      fireEvent.change(titleInput, { target: { value: newTitle } });
      expect(titleInput.value).toEqual(newTitle);
   });

   it('should update the title when submit is clicked', () => {
      // note: event names are here
      // https://github.com/testing-library/dom-testing-library/blob/master/src/events.js

      const newTitle = 'new title';
      fireEvent.change(titleInput, { target: { value: newTitle } });
      fireEvent.click(titleSubmit);
      expect(managedStore.state.title.text).toEqual(newTitle);
   });

   it('should show an error when trying to enter an empty title', () => {
      // note: event names are here
      // https://github.com/testing-library/dom-testing-library/blob/master/src/events.js
      const titleSubmit = queries.getByTestId('titleSubmit');
      fireEvent.change(titleInput, { target: { value: '' } });
      fireEvent.click(titleSubmit);
      expect(queries.getByText(/please enter a title/i)).not.toBe(null);
   });

   // TODO get this test to work
   it.skip('should not update the title when cancel is clicked', () => {
      const originalTitle = managedStore.state.title.text;
      const titleCancel = queries.getByTestId('titleCancel');
      expect(managedStore.state.title.text).toEqual(originalTitle);
      fireEvent.change(titleInput, {
         target: { value: 'Title being canceled' },
      });
      fireEvent.click(titleCancel);
      expect(managedStore.state.title.text).toEqual(originalTitle);
      expect(queries.getByTestId('titleForm')).not.toBeDefined();
   });

   // TODO get this test to work
   it.skip('should not execute javascript entered as a title', () => {
      const jsTitle = 'alert("will this alert show?")';
      fireEvent.change(titleInput, { target: { value: jsTitle } });
      fireEvent.click(titleSubmit);
      console.log('how can we test for an alert box showing or not?');
   });
});
