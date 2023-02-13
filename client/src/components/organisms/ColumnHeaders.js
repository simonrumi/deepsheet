import React, { useMemo } from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { shouldShowColumn } from '../../helpers/visibilityHelpers';
import { stateTotalColumns, stateColumnVisibility } from '../../helpers/dataStructureHelpers';
import ColumnHeader from './ColumnHeader';
import TopLeftHeader from '../atoms/TopLeftHeader';
import ColumnAdder from '../molecules/ColumnAdder';

const COLUMN_HEADER_CLASSES = 'col-span-1 row-span-1 w-full h-full p-0.5 align-middle text-center text-grey-blue border-t border-l';

const checkHeaders = headers => (headers instanceof Array && headers.length > 0 ? true : false);
const outputHeaders = arr => R.when(checkHeaders, R.identity, arr);

const ColumnHeaders = () => {
	const totalColumns = stateTotalColumns(managedStore.state);
   const renderColumnHeaders = totalColumns => {
      if (!totalColumns) {
         return null;
      }

      // recursive function to render a row of spreadeheet column headers A, B, C... etc
      const generateHeaders = (totalHeaders, currentIndex = 0, headers = []) => {
         //return the headers when we've finished creating all of them
         if (totalHeaders === currentIndex) {
            return headers;
         }

         // before the very first column we need to add a spacer column that will go above the row headers
         if (currentIndex === 0) {
            headers.push(<TopLeftHeader classes={COLUMN_HEADER_CLASSES} key="topLeftCorner" />);
         }

         if (shouldShowColumn(stateColumnVisibility(managedStore.state), currentIndex)) {
            headers.push(
               <ColumnHeader index={currentIndex} key={'col' + currentIndex} classes={COLUMN_HEADER_CLASSES} />
            );
         }

         //after the last column add a "+" to allow adding more columns
         if (currentIndex === stateTotalColumns(managedStore.state) - 1) {
            headers.push(<ColumnAdder key="columnAdder" classes={COLUMN_HEADER_CLASSES} />);
         }

         return generateHeaders(totalHeaders, ++currentIndex, headers);
      };
		return generateHeaders(totalColumns);
   }

	const renderedHeadersArr = useMemo(() => renderColumnHeaders(totalColumns), [totalColumns]);
	return outputHeaders(renderedHeadersArr);
}

export default ColumnHeaders;
