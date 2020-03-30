import * as R from 'ramda';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
   updatedEditor,
   updatedCellBeingEdited,
   setEditorRef,
} from '../../actions';
import EditorInput from '../atoms/EditorInput';

//TODO uninstall ReactQuill

class Editor extends Component {
   constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.handleBlur = this.handleBlur.bind(this);
   }

   handleBlur = () => {
      this.props.updatedEditor({});
      this.props.updatedCellBeingEdited({});
   };

   handleChange = event => {
      event.preventDefault();
      const newCellData = {
         row: this.props.editor.row,
         column: this.props.editor.column,
         content: event.target.value,
         hasChanged: true,
      };
      this.props.updatedEditor(newCellData);
      this.props.updatedCellBeingEdited(newCellData);
   };

   renderClasses = () => {
      return 'shadow-none border-solid border-2 border-grey-blue rounded w-full py-2 px-3 text-grey-blue leading-tight focus:outline-none focus:shadow focus:border-vibrant-blue focus:text-dark-dark-blue';
   };

   render() {
      return (
         <EditorInput
            classes={this.renderClasses()}
            value={this.props.editor.content || ''}
            handleChange={this.handleChange}
            disabled={this.props.editor.content ? false : true}
            handleBlur={this.handleBlur}
         />
      );
   }
}

const mapStateToProps = (state, ownProps) => {
   return {
      editor: state.editor,
      editorRef: state.editorRef,
   };
};

export default connect(
   mapStateToProps,
   { updatedEditor, updatedCellBeingEdited, setEditorRef }
)(Editor);
