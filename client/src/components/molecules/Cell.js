import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { updateEditor } from '../../actions';
import { extractRowColFromCellKey, nothing } from '../../helpers';
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

		this.renderCell = this.renderCell.bind(this);
		this.renderRegularCell = this.renderRegularCell.bind(this);
		this.renderSubSheetCell = this.renderSubSheetCell.bind(this);
		this.renderBlankCell = this.renderBlankCell.bind(this);
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
		return this.renderCell(this.props.cell);
	}

	renderCell = R.cond([
		[R.isNil, nothing],
		[
			R.pipe(
				R.prop('visible'),
				R.not
			),
			nothing,
		],
		[R.thunkify(R.identity)(this.props.blankCell), this.renderBlankCell],
		[R.hasPath(['content', '_id']), this.renderSubSheetCell],
		[
			R.pipe(
				R.hasPath(['content', '_id']),
				R.not
			),
			this.renderRegularCell,
		],
	]);

	renderSubSheetCell(cell) {
		return <SubsheetCell sheetId={cell.content._id} />;
	}

	renderBlankCell(cell) {
		return <div className={createClassNames(this.props.classes)} />;
	}

	renderRegularCell(cell) {
		return (
			<div
				className={createClassNames(this.props.classes)}
				onClick={event => this.onCellClick(event)}
				id={createCellId(cell.column, cell.row)}
			>
				{cell.content}
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
		classes: ownProps.classes,
		cell,
		managedStore,
		blankCell: ownProps.blankCell,
	};
}

export default connect(
	mapStateToProps,
	{ updateEditor }
)(Cell);
