import React from 'react';

const UndoIcon = ({
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
            <path d="M40.5,20.25c0,9.374-7.625,17-17,17c-1.656,0-3-1.343-3-3s1.344-3,3-3c6.064,0,11-4.936,11-11c0-6.065-4.936-11-11-11
		         c-5.756,0-10.486,4.447-10.953,10.086l1.832-1.832c1.171-1.172,3.071-1.172,4.242,0c1.172,1.171,1.172,3.071,0,4.242l-6.75,6.75
		         c-0.563,0.562-1.326,0.879-2.121,0.879c-0.796,0-1.559-0.316-2.121-0.879l-6.75-6.75c-1.172-1.172-1.172-3.071,0-4.242
		         c1.172-1.172,3.071-1.172,4.243,0l1.444,1.444c0.669-8.766,8-15.698,16.934-15.698C32.875,3.25,40.5,10.876,40.5,20.25z"/>
         </svg>
      </div>
   );
};

export default UndoIcon;