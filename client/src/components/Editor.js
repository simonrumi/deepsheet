import React, { Component } from 'react';
import { compose } from 'ramda'; // could have used compose from redux instead....but maybe ramda will come in handy later
import ReactQuill from 'react-quill';
import { Parser as HTMLToReactParser } from 'html-to-react';
import { connect } from 'react-redux';
import { updateEditor, setEditorRef, updateCellBeingEdited } from '../actions';
import { removePTags } from '../helpers';

class Editor extends Component {
	constructor(props) {
		super(props);
		this.setupEditorFocuser = this.setupEditorFocuser.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.reactParser = new HTMLToReactParser();
		this.processEditorContent = compose(
			this.reactParser.parse,
			removePTags
		);
	}

	render() {
		return (
			<ReactQuill
				theme="snow"
				value={this.props.editor.content || ''}
				onChange={this.handleChange}
				ref={this.setupEditorFocuser}
			/>
		);
	}

	// by putting the ref property of the Editor into the store,
	// individual cells can use the ref to cause focus to be set to the Editor,
	// when the cell is clicked
	setupEditorFocuser(element) {
		this.props.setEditorRef(element);
	}

	handleChange(newValue) {
		const row = this.props.editor.row;
		const column = this.props.editor.column;
		this.props.updateEditor({
			row,
			column,
			content: newValue,
		});

		const newSheet = { ...this.props.sheet };
		const newCellContent = this.processEditorContent(newValue);
		newSheet.content[row].content[column].content = newCellContent;
		this.props.updateCellBeingEdited(newSheet);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		sheet: state.sheet,
		editor: state.editor,
	};
}

export default connect(
	mapStateToProps,
	{ updateEditor, setEditorRef, updateCellBeingEdited }
)(Editor);
