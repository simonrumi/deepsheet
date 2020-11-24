import React from 'react';

const RedoIcon = ({
   style = {},
   width = '100%',
   height = '100%',
   classes = '',
   viewBox = '0 0 40.5 40.5',
   onClickFn,
}) => {
   const allClasses = '' + classes; // leaving this here as a reminder that we have taken out the usual base classes for an icon
   return (
      <div className={allClasses} onClick={onClickFn}>
         <svg
            style={style}
            height={height}
            width={width}
            viewBox={viewBox}
            className="fill-current"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M39.622,21.746l-6.749,6.75c-0.562,0.562-1.326,0.879-2.122,0.879s-1.56-0.316-2.121-0.879l-6.75-6.75
		         c-1.171-1.171-1.171-3.071,0-4.242c1.171-1.172,3.071-1.172,4.242,0l1.832,1.832C27.486,13.697,22.758,9.25,17,9.25
		         c-6.064,0-11,4.935-11,11c0,6.064,4.936,11,11,11c1.657,0,3,1.343,3,3s-1.343,3-3,3c-9.373,0-17-7.626-17-17s7.627-17,17-17
		         c8.936,0,16.266,6.933,16.936,15.698l1.442-1.444c1.172-1.172,3.072-1.172,4.242,0C40.792,18.674,40.792,20.574,39.622,21.746z"/>
         </svg>
      </div>
   );
};

export default RedoIcon;