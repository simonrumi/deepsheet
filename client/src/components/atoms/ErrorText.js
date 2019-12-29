import React from 'react';

const ErrorText = ({ error }) => {
   return (
      <span className="text-vibrant-burnt-orange text-xs italic">{error}</span>
   );
};

export default ErrorText;
