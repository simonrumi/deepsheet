import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setEditorRef } from '../../actions/editorActions';

class EditorInput extends Component {
   constructor(props) {
      super(props);
      this.editorInputRef = React.createRef();
   }

   componentDidMount() {
      // by putting the ref property of the Editor into the store,
      // individual cells can use the ref to cause focus to be set to the Editor,
      // when the cell is clicked
      this.props.setEditorRef(this.editorInputRef);
   }

   render() {
      return (
         <input
            className={this.props.classes}
            type="text"
            value={this.props.value}
            onChange={this.props.handleChange}
            onBlur={this.props.handleBlur}
            ref={this.editorInputRef}
            disabled={this.props.disabled}
         />
      );
   }
}

const mapStateToProps = (state, ownProps) => {
   return {
      classes: ownProps.classes,
      value: ownProps.value,
      handleChange: ownProps.handleChange,
      disabled: ownProps.disabled,
      handleBlur: ownProps.handleBlur,
   };
};

export default connect(mapStateToProps, { setEditorRef })(EditorInput);
