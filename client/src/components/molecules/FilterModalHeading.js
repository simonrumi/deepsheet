import React from 'react';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { indexToRowNumber, indexToColumnLetter, capitalCase } from '../../helpers';
import { ROW_AXIS, COLUMN_AXIS } from '../../constants';
import Heading from '../atoms/Heading';

class FilterModalHeading extends React.Component {
	getAxisName = rowIndex => (rowIndex ? ROW_AXIS : COLUMN_AXIS);

	capitalCaseAxisName = R.pipe(
		this.getAxisName,
		capitalCase
	);

	getAxisIndexConverter = rowIndex => (rowIndex ? indexToRowNumber : indexToColumnLetter);
	convertAxisIndex = (converter, rowIndex, colIndex) =>
		rowIndex ? R.toString(converter(rowIndex)) : converter(colIndex);
	getAxisNumber = (rowIndex, colIndex) =>
		this.convertAxisIndex(this.getAxisIndexConverter(rowIndex), rowIndex, colIndex);

	createFilterModalHeadingText = (rowIndex, colIndex) =>
		R.concat(R.concat(this.capitalCaseAxisName(rowIndex), ' '), this.getAxisNumber(rowIndex, colIndex));

	render() {
		return <Heading text={this.createFilterModalHeadingText(this.props.rowIndex, this.props.colIndex)} />;
	}
}

function mapStateToProps(state, ownProps) {
	return {
		rowIndex: state.filterModal.rowIndex,
		colIndex: state.filterModal.colIndex,
	};
}

export default connect(mapStateToProps)(FilterModalHeading);
