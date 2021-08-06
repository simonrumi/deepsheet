import React from 'react';
import IconCheckmark from '../atoms/IconCheckmark';

const renderCheckmark = value =>
   value ? <IconCheckmark height="1em" width="1em" classes="absolute top-0 left-0 px-1 py-1" /> : '';

const Checkbox = ({
   changeHandler,
   blurHandler,
   value = '',
   classes = '',
   error = '',
   testId = '',
}) => {
   // we need to have both onClick and onChange actions triggered in order to update the checkbox and avoid
   // an error for not having an onChange handler.
   // However, the first time the Checkbox is clicked, the handleChange function gets called twice, so we need
   // this variable to track how many times it is called.
   // Having this mutable variable is hokey....BUT when trying useState instead, it seems that the value is not
   // updated until the next time the Checkbox renders, so it is no good for finding out whether handleChange
   // is being called for a 2nd time within a single render.
   let handleChangeCalled = false;

   const allClasses =
      'relative bg-light-light-blue border border-solid border-2 border-dark-dark-blue w-6 h-6 focus:outline-none focus:shadow-md ' +
      classes;

   const handleClick = event => {
      event.preventDefault();
      changeHandler(event);
      handleChangeCalled = true;
   };

   const handleChange = event => {
      event.preventDefault();
      if (!handleChangeCalled) {
         changeHandler(event);
      }
      handleChangeCalled = false;
   };

   // note that there is some weirdness around React setting the checked value properly...see
   // https://github.com/facebook/react/issues/6321
   // although this post is old, this seems to be the current status.....so although we are setting the 
   // checked attribute here, we are really using the value attribute to track what's going on
   return (
      <div className={allClasses}>
         {renderCheckmark(value)}
         <input
            className="opacity-0 w-6 h-6"
            type="checkbox"
            error={error}
            value={value}
            onClick={handleClick}
            onChange={handleChange}
            onBlur={blurHandler}
            data-testid={testId}
            checked={value}
         />
      </div>
   );
};

export default Checkbox;
