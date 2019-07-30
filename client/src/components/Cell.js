import React, { Component } from 'react';

class Cell extends Component {
	render() {
		return (
			<div className="cell dark-dark-blue" contentEditable="true">
				Cell content
			</div>
		);
	}
}

export default Cell;
