import React from 'react';
import ErrorText from '../atoms/ErrorText';
import IconCheckmark from '../atoms/IconCheckmark';

const Checkbox = ({ formProps, testId, classes = '' }) => {
   const error =
      formProps.meta.error && formProps.meta.touched
         ? formProps.meta.error
         : '';
   const allClasses =
      'relative bg-light-light-blue border border-solid border-2 border-dark-dark-blue w-6 h-6 focus:outline-none focus:shadow-md ' +
      classes;
   // reminder: the formProps come from reduxForm....specifically the component={}
   // argument in the <Field />.
   // Also, this structure {...formProps.input} is equivalent to
   // <input onChange={formProps.input.onChange} value={formProps.input.value} etc={formProps.input.etc} />
   return (
      <div className={allClasses}>
         {renderCheckmark(formProps)}
         <input
            className="opacity-0 w-6 h-6"
            {...formProps.input}
            type="checkbox"
            error={error}
         />
         <ErrorText error={error} />
      </div>
   );
};

const renderCheckmark = formProps => {
   return formProps.input.value ? (
      <IconCheckmark
         height="1em"
         width="1em"
         classes="absolute top-0 left-0 px-1 py-1"
      />
   ) : (
      ''
   );
};

export default Checkbox;
