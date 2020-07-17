import React from 'react';

const Heading = ({ text, classes }) => {
   const allClasses = 'text-3xl text-subdued-blue ' + classes;
   return (
      <h1 className={allClasses} key="heading">
         {text}
      </h1>
   );
};

export default Heading;
