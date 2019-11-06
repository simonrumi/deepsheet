import React from 'react';
import { fireEvent } from '@testing-library/react';
import Header from '../../components/Header';
import mockSheet from '../../mockSubSheet';
import renderWithRedux from '../renderWithRedux';

describe('Header', () => {
   let queries;
   beforeEach(() => {
      queries = renderWithRedux(<Header />, mockSheet);
   });

   it('should render the title', () => {
      expect(queries.getByText(mockSheet.title)).not.toBe(null);
   });

   it('should render the up arrow for a subsheet', () => {
      expect(queries.getByTestId('titleUpArrow')).not.toBe(null);
   });

   it('should render the title editor when the edit icon is clicked', () => {
      fireEvent.click(queries.getByTestId('titleEditIcon'));
      expect(queries.getByTestId('titleForm')).not.toBe(null);
   });
});
