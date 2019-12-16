import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { updateEditor } from '../../actions';
import { extractRowColFromCellKey } from '../../helpers';
import { createClassNames, getRowNumFromObj, getColNumFromObj, createCellId } from '../../helpers/cellHelpers';
import managedStore from '../../store';
import SubsheetCell from '../atoms/SubsheetCell';

class Cell extends Component {
	constructor(props) {
		super(props);
		// having these 2 props is an OOO thing, which is probably antithetical to the functional programming
		// approach, because they provide a shared state that (at the time of writing) 2 functions use.
		// might decide later that this mix-&matching of paradigms is terrible, but leaving for now
		this._row = null;
		this._col = null;

		this.renderRegularCell = this.renderRegularCell.bind(this);
		this.renderSubSheetCell = this.renderSubSheetCell.bind(this);
	}

	componentWillMount() {
		this._row = R.pipe(
			extractRowColFromCellKey,
			getRowNumFromObj
		)(this.props.cellKey);

		this._col = R.pipe(
			extractRowColFromCellKey,
			getColNumFromObj
		)(this.props.cellKey);
	}

	render() {
		return this.renderSubSheetOrRegularCell(this.props.cell);
	}

	// cell should either be an object with an _id property, or a string like "B2"
	renderSubSheetOrRegularCell(cell) {
		return R.isNil(cell) ? null : R.ifElse(R.has('_id'), this.renderSubSheetCell, this.renderRegularCell)(cell);
	}

	renderSubSheetCell(cell) {
		return <SubsheetCell sheetId={cell._id} />;
	}

	renderRegularCell(cellId) {
		return (
			<div
				className={createClassNames(this.props.sheet, this.props.cellKey)}
				onClick={event => this.onCellClick(event)}
				id={createCellId(this._col, this._row)}
			>
				{this.props.cell}
			</div>
		);
	}

	onCellClick(event) {
		const cellData = {
			row: this._row,
			column: this._col,
			content: event.target.innerHTML,
		};
		this.props.updateEditor(cellData);
		this.props.editorRef.focus();
	}
}

function mapStateToProps(state, ownProps) {
	const cell = managedStore.state[ownProps.cellKey];
	return {
		sheet: state.sheet,
		editorRef: state.editorRef,
		cellKey: ownProps.cellKey,
		cell,
		managedStore,
	};
}

export default connect(
	mapStateToProps,
	{ updateEditor }
)(Cell);
