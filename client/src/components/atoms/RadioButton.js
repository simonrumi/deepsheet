import React from 'react';
import { TOOL_ICON_WIDTH } from '../../constants';

const RadioButton = ({
   style = {},
   classes = '',
   changeHandler,
   isSelected
}) => {
   const parentClasses =
      'cursor-pointer rounded-full border-2 border-subdued-blue hover:border-vibrant-blue flex justify-center items-center' +
      classes;
   const parentSize = (parseInt(TOOL_ICON_WIDTH) * 0.75) + 'em';
   const parentStyles = {
      ...style,
      width: parentSize,
      height: parentSize,
   };
   const childClasses = isSelected 
      ? 'rounded-full bg-subdued-blue hover:bg-vibrant-blue'
      : 'hidden';
   const childSize = (parseInt(TOOL_ICON_WIDTH) * 0.4) + 'em';
   const childStyles = {
      width: childSize,
      height: childSize,
   }
   return (
      <div className={parentClasses} style={parentStyles} onClick={changeHandler} >
         <div className={childClasses} style={childStyles}></div>
      </div>
   );
};

export default RadioButton;