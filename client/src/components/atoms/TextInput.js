import React from 'react';
import * as R from 'ramda';

const TextInput = ({
   inputProps,
   autoComplete = 'off',
   inputType = 'text',
   error = '',
   testId,
}) => {
   const borderColor = error
      ? ' border-vibrant-burnt-orange'
      : ' border-light-light-blue';
   const baseClasses =
      'shadow-none appearance-none border rounded w-full py-2 px-3 text-grey-blue leading-tight focus:outline-none focus:shadow';
   return (
      <div className="w-full pr-2">
         <input
            className={R.concat(baseClasses, borderColor)}
            {...inputProps}
            autoComplete
            type={inputType}
            error
            data-testid={testId}
         />
         <div className="text-vibrant-burnt-orange text-xs italic">{error}</div>
      </div>
   );
};

export default TextInput;
