import React from 'react';
import * as R from 'ramda';
import ErrorText from '../atoms/ErrorText';

const TextInput = ({
   formProps,
   autoComplete = 'off',
   classes = '',
   testId,
}) => {
   const error =
      formProps.meta.error && formProps.meta.touched
         ? formProps.meta.error
         : '';

   const borderColor = error
      ? ' border-vibrant-burnt-orange'
      : ' border-light-light-blue';

   const baseClasses =
      'shadow-none appearance-none border rounded w-full py-2 px-3 text-grey-blue leading-tight focus:outline-none focus:shadow ' +
      classes;

   // reminder: the formProps come from reduxForm....specifically the component={}
   // argument in the <Field />.
   // Also, this structure {...formProps.input} is equivalent to
   // <input onChange={formProps.input.onChange} value={formProps.input.value} etc={formProps.input.etc} />
   return (
      <div className="w-full px-2">
         <input
            className={R.concat(baseClasses, borderColor)}
            {...formProps.input}
            autoComplete={autoComplete}
            type="text"
            error={error}
            data-testid={testId}
         />
         <ErrorText error={error} />
      </div>
   );
};

export default TextInput;
