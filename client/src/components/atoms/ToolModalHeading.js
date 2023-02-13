import React from 'react';
import * as R from 'ramda';
import { indexToRowNumber, indexToColumnLetter, capitalCase, concatAll } from '../../helpers';
import { ROW_AXIS, COLUMN_AXIS } from '../../constants';
import Heading from '../atoms/Heading';

const ToolModalHeading = ({ rowIndex, columnIndex }) => {
	console.log('ToolModalHeading started with columnIndex', columnIndex);
   const capitalCaseAxisName = R.pipe(
      rowIndex => (rowIndex ? ROW_AXIS : COLUMN_AXIS),
      capitalCase
   )(rowIndex);
   const axisIndexConverter = rowIndex ? indexToRowNumber : indexToColumnLetter;
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