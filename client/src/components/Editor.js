import React, { Component } from 'react';
import { compose } from 'ramda'; // could have used compose from redux instead....but maybe ramda will come in handy later
import ReactQuill from 'react-quill';
import { Parser as HTMLToReactParser } from 'html-to-react';
import { connect } from 'react-redux';
import {
   updateEditor,
   setEditorRef,
   /*updatedCell*/ updatedCellBeingEdited,
} from '../actions';
import { removePTags } from '../helpers';

class Editor extends Component {
   constructor(props) {
      super(props);
      this.getEditorContent = this.getEditorContent.bind(this);
      this.setupEditorFocuser = this.setupEditorFocuser.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.reactParser = new HTMLToReactParser();
      this.processEditorContent = compose(
         this.reactParser.parse,
         removePTags
      );
   }

   getEditorContent() {
      if (this.props.editor && this.props.editor.content) {
         return this.props.editor.content;
      }
      return '';
   }

   render() {
      console.log('Editor.js is temporarily not displaying the editor');
      return null;
      return (
         <ReactQuill
            theme="snow"
            value={
               this.props.editor && this.props.editor.content
                  ? this.props.editor.content
                  : ''
            }
            onChange={this.handleChange}
            ref={this.setupEditorFocuser}
         />
      );
   }

   // by putting the ref property of the Editor into the store,
   // individual cells can use the ref to cause focus to be set to the Editor,
   // when the cell is clicked
   setupEditorFocuser(element) {
      if (Object.keys(this.props.editorRef).length === 0) {
         this.props.setEditorRef(element);
      }
   }

   handleChange(newValue) {
      const newCellData = {
         row: this.props.editor.row,
         column: this.props.editor.column,
         content: newValue,
      };
      this.props.updateEditor(newCellData);
      const processedContent = this.processEditorContent(newValue);
      this.props.updatedCellBeingEdited({
         ...newCellData,
         content: processedContent,
      });
   }
}

function mapStateToProps(state, ownProps) {
   return {
      sheet: state.sheet,
      editor: state.editor,
      editorRef: state.editorRef,
   };
}

export default connect(
   mapStateToProps,
   { updateEditor, setEditorRef, /*updatedCell*/ updatedCellBeingEdited }
)(Editor);
