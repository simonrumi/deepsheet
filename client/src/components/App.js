import { map } from 'ramda';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Header from './Header';
import Editor from './Editor';
import Row from './Row';
import { fetchSheet } from '../helpers';
import { fetchedSheet } from '../actions';
import { generateCellReducers } from '../reducers/reducerManager';
import { populateCellsInStore } from '../reducers/cellReducers';

class App extends Component {
	async componentDidMount() {
		//populate the store with the sheet data
		const sheet = await fetchSheet();
		this.props.fetchedSheet(sheet);
	}

	renderRows() {
		// TODO don't send the actual row content, instead just send the row number
		// and have the Row component get the content from the sheet in the Store
		if (this.props.sheet && this.props.sheet.content) {
			const generateRows = map(row => <Row cells={row.content} key={row.metadata.row} />);
			return generateRows(this.props.sheet.content);
		}
		return <div>No row data yet</div>;
	}

	renderGridSizingSyle() {
		if (this.props.sheet.metadata) {
			const columnsStyle = 'repeat(' + this.props.sheet.metadata.totalColumns + ', [col-start] 1fr)';
			const rowsStyle = 'repeat(' + this.props.sheet.metadata.totalRows + ', [row-start] 1fr)';
			return {
				gridTemplateColumns: columnsStyle,
				gridTemplateRows: rowsStyle,
			};
		}
	}

	initializeCells() {
		// TODO: the end goal is not to put the whole sheet in the store,
		// but to have the collection of individual cell reducers instead

		if (this.props.sheet && this.props.sheet.metadata) {
			generateCellReducers(this.props.sheet.metadata);
			populateCellsInStore(this.props.sheet);
		}
	}

	render() {
		this.initializeCells();
		return (
			<div className="ui container">
				<Header />
				<div className="editor-container">
					<Editor />
				</div>
				<div className="grid-container" style={this.renderGridSizingSyle()}>
					{this.renderRows()}
				</div>
				<div className="clear" />
			</div>
		);
	}
}

function mapStateToProps(state) {
	return { rows: state.rows, sheet: state.sheet };
}

export default connect(
	mapStateToProps,
	{
		fetchedSheet,
	}
)(App);
