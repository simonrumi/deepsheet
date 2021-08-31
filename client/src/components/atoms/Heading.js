import React from 'react';

const Heading = React.memo(({ text, classes, onClickFn }) => {
   const allClasses = 'text-3xl text-subdued-blue ' + classes;
   return (
      <h1 className={allClasses} key="heading" onClick={onClickFn} >
         {text}
      </h1>
   );
});

export default Heading;
