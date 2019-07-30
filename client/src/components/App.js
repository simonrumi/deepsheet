import React, { Component } from 'react';
import Column from './Column';
import mockSheet from './mockSheet';
import _ from 'lodash';

class App extends Component {
	state = {
		columns: {},
	};

	componentDidMount() {
		this.setState({ columns: this.getColumns(this.getSheet()) });
	}

	getSheet() {
		// call the database and return some json with sheet data
		//mocking this for now
		return mockSheet;
	}

	getColumns(data) {
		if (data.metadata.type === 'sheet') {
			return data.content;
		}
		throw new Error('getColumns() expected a sheet as a json object, but got something else');
	}

	renderColumns() {
		return _.map(this.state.columns, column => {
			return <Column cells={column.content} key={column.metadata.column} />;
		});
	}

	getCells() {}

	render() {
		return (
			<div>
				<h2 className="vibrant-blue">Deep Sheet</h2>
				{this.renderColumns()}
				<div className="clear" />
			</div>
		);
	}
}

export default App;
