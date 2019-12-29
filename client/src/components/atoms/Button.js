import React from 'react';
import * as R from 'ramda';

const BASE_CLASSES =
   'px-2 py-1 border border-solid border-2 rounded focus:outline-none focus:shadow-md';
const SUBMIT_CLASSES = ' border-subdued-blue hover:border-vibrant-blue';
const CANCEL_CLASSES = ' border-burnt-orange hover:border-vibrant-burnt-orange';
const BUTTON_CLASSES = ' border-dark-dark-blue hover:border-vibrant-blue';
const DISABLED_CLASSES = ' border-grey-blue';
const SUBMIT_TYPE = 'submit';
const CANCEL_TYPE = 'cancel';
const RESET_TYPE = 'reset';
const BUTTON_TYPE = 'button';

const Button = ({
   classes,
   onClickFn,
   label,
   buttonType = BUTTON_TYPE,
   disabled = false,
   testId,
}) => {
   const lowerCaseButtonType = R.toLower(buttonType);
   return (
      <div className={classes}>
         <button
            className={allClasses(disabled, lowerCaseButtonType)()}
            onClick={onClickFn}
            type={buttonType}
            data-testid={testId}
            disabled={disabled}
         >
            {label}
         </button>
      </div>
   );
};

const enabledClasses = R.cond([
   [R.equals(SUBMIT_TYPE), R.always(R.concat(BASE_CLASSES, SUBMIT_CLASSES))],
   [
      R.or(R.equals(CANCEL_TYPE), R.equals(RESET_TYPE)),
      R.always(R.concat(BASE_CLASSES, CANCEL_CLASSES)),
   ],
   [R.equals(BUTTON_TYPE), R.always(R.concat(BASE_CLASSES, BUTTON_CLASSES))],
]);

const allClasses = (disabled, buttonType) =>
   R.ifElse(
      R.always(disabled),
      R.always(R.concat(BASE_CLASSES, DISABLED_CLASSES)),
      R.always(enabledClasses(buttonType))
   );

export default Button;
