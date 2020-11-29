import React from 'react';
import ErrorText from '../atoms/ErrorText';
import IconCheckmark from '../atoms/IconCheckmark';

const renderCheckmark = value =>
   value ? <IconCheckmark height="1em" width="1em" classes="absolute top-0 left-0 px-1 py-1" /> : '';

const Checkbox = props => {
   const { changeHandler, value = false, classes = '', error = '' } = props.props;
   const allClasses =
      'relative bg-light-light-blue border border-solid border-2 border-dark-dark-blue w-6 h-6 focus:outline-none focus:shadow-md ' +
      classes;
   return (
      <div className={allClasses}>
         {renderCheckmark(value)}
         <input
            className="opacity-0 w-6 h-6"
            type="checkbox"
            error={error}
            value={value}
            onClick={changeHandler} 
         />
         <ErrorText error={error} />
      </div>
   );
};

export default Checkbox;
