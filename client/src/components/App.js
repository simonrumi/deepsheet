import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Editor from './Editor';
import Row from './Row';
import { fetchSheet } from '../actions';

class App extends Component {
	componentDidMount() {
		this.props.fetchSheet();
	}

	renderRows() {
		return _.map(this.props.sheet.content, row => {
			return <Row cells={row.content} key={row.metadata.row} />;
		});
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

	render() {
		return (
			<div>
				<h2 className="vibrant-blue text">Deep Sheet</h2>
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
	{ fetchSheet }
)(App);
