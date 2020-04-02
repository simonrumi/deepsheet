import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchSummaryCellFromSheet } from '../../services/sheetServices';
import { loadSheet } from '../../helpers';

class SubsheetCell extends Component {
	constructor(props) {
		super(props);
		console.log(
			'TODO SubsheetCell needs to call fetchSummaryCellFromSheet with this.props.subSheetId',
			this.props.subSheetId
		);
		//const summaryCell = this.props.fetchSummaryCellFromSheet(this.props.subSheetId);
		//console.log('SubsheetCell got summaryCell', summaryCell);
	}

	// const subContent = await fetchSummaryCellFromSheet(cell.content.subSheetId);
	// console.log('Cell.renderSubSheetCell got subContent', subContent);

	// renderBlankCell(cell) {
	// 	return <div className={createClassNames(this.props.classes)} />;
	// }

	render() {
		return (
			<div
				className="grid-item border border-burnt-orange cursor-pointer"
				onClick={() => loadSheet(this.props.subSheetId)}
			>
				<div>TODO need this.summaryCell in here</div>
			</div>
		);
	}
}

// sheetId={cell.content.subSheetId} content={subContent}

function mapStateToProps(state, ownProps) {
	return {
		cell: ownProps.cell, // might not need this
		subSheetId: ownProps.cell.content.subSheetId,
	};
}

export default connect(
	mapStateToProps,
	{ fetchSummaryCellFromSheet }
)(SubsheetCell);
