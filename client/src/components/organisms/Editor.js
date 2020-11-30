import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { updatedEditor } from '../../actions/editorActions';
import { updatedCellBeingEdited, hasChangedCell } from '../../actions/cellActions';
import { isSomething, isNothing } from '../../helpers';
import { stateEditor, stateEditorContent, stateEditorRow, stateEditorColumn, stateEditorRef } from '../../helpers/dataStructureHelpers';
import { startedUndoableAction, completedUndoableAction } from '../../actions/undoActions'; 
import EditorInput from '../atoms/EditorInput';

class Editor extends Component {
   constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.handleBlur = this.handleBlur.bind(this);
   }

   handleBlur = () => {
      completedUndoableAction('ended editing cell at row ' + this.props.editorRow + ', column ' + this.props.editorColumn);
      //this must happen 1 tick later so that clicking on the newDoc icon will get registered
      window.setTimeout(() => {
         this.props.updatedEditor({});
         this.props.updatedCellBeingEdited({});
      }, 0);
   };

   handleChange = event => {
      event.preventDefault();
      const newCellData = {
         row: this.props.editorRow,
         column: this.props.editorColumn,
         content: { text: event.target.value },
         isStale: true,
      };
      this.props.updatedEditor(newCellData);
      this.props.updatedCellBeingEdited(newCellData);
      this.props.hasChangedCell({
         row: this.props.editorRow,
         column: this.props.editorColumn,
      });
   };

   renderClasses = () => {
      return 'shadow-none border-solid border-2 border-grey-blue rounded w-full py-2 px-3 text-grey-blue leading-tight focus:outline-none focus:shadow focus:border-vibrant-blue focus:text-dark-dark-blue';
   };

   render() {
      const value = R.cond([
         [isNothing, () => ''],
         [isSomething, R.prop('text')],
      ])(this.props.editorContent);

      return (
         <EditorInput
            classes={this.renderClasses()}
            value={value}
            handleChange={this.handleChange}
            disabled={this.props.editorContent ? false : true}
            handleBlur={this.handleBlur}
            handleFocus={startedUndoableAction}
         />
      );
   }
}

const mapStateToProps = (state, ownProps) => {
   return {
      editor: stateEditor(state),
      editorContent: stateEditorContent(state),
      editorRow: stateEditorRow(state),
      editorColumn: stateEditorColumn(state),
      editorRef: stateEditorRef(state),
   };
};

export default connect(mapStateToProps, {
   updatedEditor,
   updatedCellBeingEdited,
   hasChangedCell,
})(Editor);
