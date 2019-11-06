import React from 'react';
import { fireEvent } from '@testing-library/react';
import TitleForm from '../../components/TitleForm';
import mockSheet from '../../mockSubSheet';
import renderWithRedux from '../renderWithRedux';

describe('TitleForm', () => {
   let queries;
   beforeEach(() => {
      queries = renderWithRedux(
         <TitleForm title={mockSheet.title} />,
         mockSheet
      );
   });

   it('should display the edit title form with the current title loaded', () => {
      expect(queries.getByTestId('titleForm')).not.toBe(null);
      const titleInput = queries.getByTestId('titleInput');
      expect(titleInput.value).toEqual(mockSheet.title);
   });
});
