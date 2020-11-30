import React, { useState, useEffect } from 'react';
import { setEditorRef } from '../../actions/editorActions';

const EditorInput = props => {
   const { classes, value, handleChange, disabled, handleBlur, handleFocus } = props;

   // by putting the ref property of the Editor into the store,
   // individual cells can use the ref to cause focus to be set to the Editor,
   // when the cell is clicked
   const [editorInputRef, seteditorInputRef] = useState(React.createRef());
   useEffect(() => setEditorRef(editorInputRef), []); // equivalent to componentDidMount per https://medium.com/@felippenardi/how-to-do-componentdidmount-with-react-hooks-553ba39d1571

   const render = () => {
      return (
         <input
            className={classes}
            type="text"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            ref={editorInputRef}
            disabled={disabled}
         />
      );
   }

   return render();
}

export default EditorInput;
