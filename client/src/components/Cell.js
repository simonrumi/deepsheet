import React, { Component } from 'react';

class Cell extends Component {
	createCellContent() {
		return <div>*** {this.props.content} ***</div>;
	}

	render() {
		return (
			<div className="cell dark-dark-blue" contentEditable="true">
				{this.createCellContent()}
			</div>
		);
	}
}

export default Cell;
