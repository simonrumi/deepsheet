import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { updatedEditor, setEditorRef } from '../../actions/editorActions';
import { updatedCellBeingEdited, hasChangedCell } from '../../actions/cellActions';
import { isSomething, isNothing } from '../../helpers';
import EditorInput from '../atoms/EditorInput';

class Editor extends Component {
   constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.handleBlur = this.handleBlur.bind(this);
   }

   handleBlur = () => {
      //this must happen 1 tick later so that clicking on the newDoc icon will get registered
      window.setTimeout(() => {
         this.props.updatedEditor({});
         this.props.updatedCellBeingEdited({});
      }, 0);
   };

   handleChange = event => {
      event.preventDefault();
      const newCellData = {
         row: this.props.editor.row,
         column: this.props.editor.column,
         content: { text: event.target.value },
         isStale: true,
      };
      this.props.updatedEditor(newCellData);
      this.props.updatedCellBeingEdited(newCellData);
      this.props.hasChangedCell({
         row: this.props.editor.row,
         column: this.props.editor.column,
      });
   };

   renderClasses = () => {
      return 'shadow-none border-solid border-2 border-grey-blue rounded w-full py-2 px-3 text-grey-blue leading-tight focus:outline-none focus:shadow focus:border-vibrant-blue focus:text-dark-dark-blue';
   };

   render() {
      const value = R.cond([
         [isNothing, () => ''],
         [isSomething, R.prop('text')],
      ])(this.props.editor.content);

      return (
         <EditorInput
            classes={this.renderClasses()}
            value={value}
            handleChange={this.handleChange}
            disabled={this.props.editor.content ? false : true}
            handleBlur={this.handleBlur}
         />
      );
   }
}

const mapStateToProps = (state, ownProps) => {
   return {
      state,
      editor: state.editor,
      editorRef: state.editorRef,
   };
};

export default connect(mapStateToProps, {
   updatedEditor,
   updatedCellBeingEdited,
   setEditorRef,
   hasChangedCell,
})(Editor);
