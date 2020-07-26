import React from 'react';

const IconDownToSubsheet = ({
   style = {},
   width = '100%',
   height = '100%',
   classes = '',
   viewBox = '0 0 477.867 477.867',
   onClickFn,
   onMouseDownFn,
}) => {
   const allClasses = 'text-subdued-blue hover:text-vibrant-blue cursor-pointer ' + classes;
   return (
      <div className={allClasses} onClick={onClickFn} onMouseDown={onMouseDownFn}>
         <svg
            style={style}
            height={height}
            width={width}
            viewBox={viewBox}
            className="fill-current"
            xmlns="http://www.w3.org/2000/svg">
            <g>
               <g>
                  <path
                     d="M409.6,153.6h-85.333c-9.426,0-17.067,7.641-17.067,17.067s7.641,17.067,17.067,17.067H409.6
                     c9.426,0,17.067,7.641,17.067,17.067v221.867c0,9.426-7.641,17.067-17.067,17.067H68.267c-9.426,0-17.067-7.641-17.067-17.067
                     V204.8c0-9.426,7.641-17.067,17.067-17.067H153.6c9.426,0,17.067-7.641,17.067-17.067S163.026,153.6,153.6,153.6H68.267
                     c-28.277,0-51.2,22.923-51.2,51.2v221.867c0,28.277,22.923,51.2,51.2,51.2H409.6c28.277,0,51.2-22.923,51.2-51.2V204.8
                     C460.8,176.523,437.877,153.6,409.6,153.6z"
                  />
               </g>
            </g>
            <g>
               <g>
                  <path
                     d="M335.947,243.934c-6.614-6.387-17.099-6.387-23.712,0L256,300.134V17.067C256,7.641,248.359,0,238.933,0
                  s-17.067,7.641-17.067,17.067v283.068l-56.201-56.201c-6.78-6.548-17.584-6.361-24.132,0.419c-6.388,6.614-6.388,17.1,0,23.713
                  l85.333,85.333c6.657,6.673,17.463,6.687,24.136,0.03c0.01-0.01,0.02-0.02,0.031-0.03l85.333-85.333
                  C342.915,261.286,342.727,250.482,335.947,243.934z"
                  />
               </g>
            </g>
         </svg>
      </div>
   );
};

export default IconDownToSubsheet;
