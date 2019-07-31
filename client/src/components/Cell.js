import React, { Component } from 'react';
import ReactQuill from 'react-quill';

class Cell extends Component {
	constructor(props) {
		super(props);
		this.state = { text: this.props.content };
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(value) {
		this.setState({ text: value });
	}

	createCellContent() {
		return (
			<div>
				<ReactQuill theme="snow" value={this.state.text} onChange={this.handleChange} />
			</div>
		);
	}

	render() {
		// top level div used to have this: contentEditable="true"
		return <div className="cell dark-dark-blue">{this.createCellContent()}</div>;
	}
}

export default Cell;
