import React, { Component } from 'react';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { indexToColumnLetter } from '../../helpers';
import ColumnHeader from '../molecules/ColumnHeader';
import TopLeftHeader from '../atoms/TopLeftHeader';
import FilterModal from './FilterModal';

const COLUMN_HEADER_CLASSES = 'grid-header-item text-grey-blue border-t border-l h-12';

class ColumnHeaders extends Component {
	constructor(props) {
		super(props);
		this.indexToColumnLetter = indexToColumnLetter.bind(this);
	}

	render() {
		const headers = this.renderColumnHeaders();
		return (
			<div className="grid-container mt-2" style={this.renderGridSizingStyle(1, this.props.sheet.totalColumns)}>
				{this.outputHeaders(headers)}
				<FilterModal />
			</div>
		);
	}

	renderColumnHeaders() {
		if (!this.props.sheet.totalColumns) {
			return null;
		}

		// recursive function to render a row of spreadeheet column headers A, B, C... etc
		const generateHeaders = (totalHeaders, indexToNameFn, currentIndex = 0, headers = []) => {
			//return the headers when we've finished creating all of them
			if (totalHeaders === currentIndex) {
				return headers;
			}

			// before the very first column we need to add a spacer column that will go above the row headers
			if (currentIndex === 0) {
				headers.push(<TopLeftHeader classes={COLUMN_HEADER_CLASSES} key="topLeftCorner" />);
			}

			headers.push(
				<ColumnHeader
					index={currentIndex}
					key={'col' + currentIndex}
					totalColumns={this.props.sheet.totalColumns}
					classes={COLUMN_HEADER_CLASSES}
				/>
			);
			return generateHeaders(totalHeaders, indexToNameFn, ++currentIndex, headers);
		};
		return generateHeaders(this.props.sheet.totalColumns, this.indexToColumnLetter);
	}

	checkHeaders = headers => (headers instanceof Array && headers.length > 0 ? true : false);
	outputHeaders = arr => R.when(this.checkHeaders, R.identity, arr);

	renderGridSizingStyle(numRows, numCols) {
		const rowsStyle = 'repeat(' + numRows + ', 1.5em)';
		const columnsStyle = '2em repeat(' + numCols + ', 1fr)';
		return {
			gridTemplateRows: rowsStyle,
			gridTemplateColumns: columnsStyle,
		};
	}
}

function mapStateToProps(state) {
	return {
		sheet: state.sheet,
	};
}

export default connect(mapStateToProps)(ColumnHeaders);
