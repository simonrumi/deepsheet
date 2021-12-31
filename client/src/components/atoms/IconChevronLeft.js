import React from 'react';

const IconChevronLeft = ({
   style = {},
   width = '100%',
   height = '100%',
   classes = '',
   svgClasses = '',
   viewBox = '0 0 512 512',
   onClickFn,
   onMouseDownFn
}) => {
   const allClasses = 'text-subdued-blue hover:text-vibrant-blue cursor-pointer ' + classes;
   const allSvgClasses = 'fill-current ' + svgClasses;
   return (
      <div className={allClasses} onClick={onClickFn} onMouseDown={onMouseDownFn}>
         <svg
            style={style}
            height={height}
            width={width}
            viewBox={viewBox}
            className={allSvgClasses}
            xmlns="http://www.w3.org/2000/svg">
            <path d="M249.513,11c30.544-.5,52.439,29.608,33.442,55.391L94.724,254.53,282.955,442.669c12.674,31.057-8.918,73.9-46.819,50.616L71.793,329.022C56.941,314.177,18.918,285.4,12.553,265.99c-10.111-30.838,32.092-58.819,45.863-72.581L175.941,75.941C199.351,52.543,218.488,27,249.513,11Zm212.118,0c29.581-.482,52.363,28.6,33.442,55.391L306.842,254.53,495.073,442.669c11.821,32.079-9.244,73.781-46.819,50.616L281.044,326.157c-14.582-14.575-52.2-42.833-57.329-63.032-7.324-28.864,33.667-56.573,47.774-70.671L389.969,74.031C412.554,51.458,431.147,25.765,461.631,11Z"/>
         </svg>
      </div>
   );
};
export default IconChevronLeft;
