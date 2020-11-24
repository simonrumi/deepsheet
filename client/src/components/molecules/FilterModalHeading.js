import React from 'react';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { indexToRowNumber, indexToColumnLetter, capitalCase } from '../../helpers';
import { stateFilterRowIndex, stateFilterColumnIndex } from '../../helpers/dataStructureHelpers';
import { ROW_AXIS, COLUMN_AXIS } from '../../constants';
import Heading from '../atoms/Heading';

class FilterModalHeading extends React.Component {
	getAxisName = rowIndex => (rowIndex ? ROW_AXIS : COLUMN_AXIS);

	capitalCaseAxisName = R.pipe(
		this.getAxisName,
		capitalCase
	);

	getAxisIndexConverter = rowIndex => (rowIndex ? indexToRowNumber : indexToColumnLetter);
	convertAxisIndex = (converter, rowIndex, columnIndex) =>
		rowIndex ? R.toString(converter(rowIndex)) : converter(columnIndex);
	getAxisNumber = (rowIndex, columnIndex) =>
		this.convertAxisIndex(this.getAxisIndexConverter(rowIndex), rowIndex, columnIndex);

	createFilterModalHeadingText = (rowIndex, columnIndex) =>
		R.concat(R.concat(this.capitalCaseAxisName(rowIndex), ' '), this.getAxisNumber(rowIndex, columnIndex));

	render() {
		return <Heading text={this.createFilterModalHeadingText(this.props.rowIndex, this.props.columnIndex)} />;
	}
}

function mapStateToProps(state, ownProps) {
	return {
      rowIndex: stateFilterRowIndex(state),
      columnIndex: stateFilterColumnIndex(state),
	};
}

export default connect(mapStateToProps)(FilterModalHeading);
