import React from 'react';
import Button from '../atoms/Button';
import Label from '../atoms/Label';

const SortOptions = ({ classes, onClickAtoZ, onClickZtoA }) => {
   return (
      <div className={classes}>
         <Label label="Sort" />
         <Button
            classes="ui mini blue basic button"
            onClickFn={onClickAtoZ}
            label="A to Z"
         />

         <Button
            classes="ui mini blue basic button"
            onClickFn={onClickZtoA}
            label="Z to A"
         />
      </div>
   );
};

export default SortOptions;
