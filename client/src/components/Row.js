import React, { Component } from 'react';
import Cell from './Cell';
import _ from 'lodash'; //TODO use ramda instead and uninstall lodash
import { connect } from 'react-redux';

class Row extends Component {
	createCells() {
		return _.map(this.props.cells, cell => {
			const isLastColumn = this.props.sheet.metadata.totalColumns - 1 === cell.metadata.column;
			const isLastRow = this.props.sheet.metadata.totalRows - 1 === cell.metadata.row;
			return (
				<Cell
					row={cell.metadata.row}
					column={cell.metadata.column}
					key={cell.metadata.column + '-' + cell.metadata.row}
					isLastColumn={isLastColumn}
					isLastRow={isLastRow}
				/>
			);
		});
	}
	render() {
		return this.createCells();
	}
}

function mapStateToProps(state, ownProps) {
	return {
		sheet: state.sheet,
		//cells: ownProps.cells,
	};
}

export default connect(mapStateToProps)(Row);
