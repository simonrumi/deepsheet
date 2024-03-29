import React from 'react';

const IconNewDoc = ({
   style = {},
   width = '100%',
   height = '100%',
   classes = '',
   svgClasses = '',
   viewBox = '0 0 45.773 45.773',
   onClickFn,
   onMouseDownFn,
}) => {
   const allSvgClasses = 'text-subdued-blue hover:text-vibrant-blue cursor-pointer fill-current ' + svgClasses;
   return (
      <div className={classes} >
         <svg
            style={style}
            height={height}
            width={width}
            viewBox={viewBox}
            className={allSvgClasses}
            onClick={onClickFn} 
            onMouseDown={onMouseDownFn}
            xmlns="http://www.w3.org/2000/svg">
            <path
               d="M31.199,5.754V0H7.34C5.212,0,3.513,1.759,3.513,3.888v38.05c0,2.129,1.699,3.836,3.827,3.836h31.087
			c2.129,0,3.833-1.707,3.833-3.836V11.131h-5.698C33.613,11.131,31.199,8.702,31.199,5.754z M29.835,25.898h-3.992v3.979
			c0,1.648-1.309,2.984-2.956,2.984c-1.648,0-2.957-1.336-2.957-2.984v-3.979h-3.994c-1.648,0-2.992-1.336-2.992-2.984
			s1.349-2.984,2.996-2.984h3.99v-3.979c0-1.648,1.309-2.984,2.957-2.984c1.647,0,2.956,1.336,2.956,2.984v3.979h3.992
			c1.648,0,2.984,1.336,2.984,2.984S31.483,25.898,29.835,25.898z"
            />
            <path d="M34.19,0.034v5.72c0,1.303,1.068,2.386,2.371,2.386h5.698V8.086L34.19,0.034z" />
         </svg>
      </div>
   );
};

export default IconNewDoc;
