import { map } from 'ramda';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Header from './Header';
import Editor from './Editor';
import Row from './Row';
import { fetchSheet } from '../helpers';
import { fetchedSheet, populateCellsInStore } from '../actions';
import { createCellReducers } from '../reducers/cellReducers';
import managedStore from '../store';

class App extends Component {
	async componentDidMount() {
		//populate the store with the sheet data
		// TODO: the end goal is not to put the whole sheet in the store,
		// but to have the collection of individual cell reducers instead
		const sheet = await fetchSheet();
		this.props.fetchedSheet(sheet);
		this.initializeCells();
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
		if (this.props.sheet && this.props.sheet.metadata && this.props.managedStore.store) {
			const newCombinedReducer = createCellReducers(this.props.sheet.metadata);

			this.props.managedStore.store.replaceReducer(newCombinedReducer);
			populateCellsInStore(this.props.sheet);
		} else {
			console.log('Note: App.render.initializeCells had no data to operate on');
		}
	}

	render() {
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
	return { rows: state.rows, sheet: state.sheet, managedStore: managedStore };
}

export default connect(
	mapStateToProps,
	{
		fetchedSheet,
		populateCellsInStore,
	}
)(App);
