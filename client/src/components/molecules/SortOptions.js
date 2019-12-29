import React from 'react';
import Button from '../atoms/Button';
import Label from '../atoms/Label';

const SortOptions = ({ classes = '', onClickAtoZ, onClickZtoA }) => {
   const allClasses =
      'border border-solid border-grey-blue flex items-center justify-between px-2 py-2 ' +
      classes;
   return (
      <div className={allClasses}>
         <Label label="Sort" />
         <div className="flex items-center justify-around px-2 py-2">
            <Button
               buttonType="button"
               classes="pr-2"
               onClickFn={onClickAtoZ}
               label="A to Z"
            />
            <Button
               buttonType="button"
               classes="pl-2"
               onClickFn={onClickZtoA}
               label="Z to A"
            />
         </div>
      </div>
   );
};

export default SortOptions;
