import React from 'react';
import * as R from 'ramda';
import { indexToRowNumber, indexToColumnLetter, capitalCase, concatAll } from '../../helpers';
import { ROW_AXIS, COLUMN_AXIS } from '../../constants';
import Heading from '../atoms/Heading';

const ToolModalHeading = props => {
   const { rowIndex, columnIndex } = props;
   const capitalCaseAxisName = R.pipe(
      rowIndex => (rowIndex ? ROW_AXIS : COLUMN_AXIS),
      capitalCase
   )(rowIndex);
   console.log('ToolModalHeading got columnIndex', columnIndex, 'about to call indexToColumnLetter')
   const axisIndexConverter = rowIndex ? indexToRowNumber : indexToColumnLetter;
   console.log('ToolModalHeading finished calling indexToColumnLetter');
	const convertAxisIndex = (converter, rowIndex, columnIndex) => rowIndex ? R.toString(converter(rowIndex)) : converter(columnIndex);
	const getAxisItemValue = (rowIndex, columnIndex) => convertAxisIndex(axisIndexConverter, rowIndex, columnIndex);
	const createModalHeadingText = (rowIndex, columnIndex) => concatAll([
      capitalCaseAxisName, 
      ' ', 
      getAxisItemValue(rowIndex, columnIndex)
   ]);
   return <Heading text={createModalHeadingText(rowIndex, columnIndex)} />;
}

export default ToolModalHeading;