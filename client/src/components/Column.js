import React, { Component } from 'react';
import Cell from './Cell';
import _ from 'lodash';

class Column extends Component {
	createCells() {
		return _.map(this.props.cells, cell => {
			return <Cell content={cell.content} key={cell.metadata.row + '-' + cell.metadata.column} />;
		});
	}
	render() {
		//contenteditable="true" was inside column-container originally
		return (
			<div className="column-container">
				<div className="columnm-header" />
				{this.createCells()}
			</div>
		);
	}
}

export default Column;
