import React from 'react';

const IconChevronRight = ({
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
            <path d="M263.487,500c-30.544.5-52.439-29.608-33.442-55.391L418.276,256.47,230.045,68.331c-12.674-31.057,8.918-73.9,46.819-50.616L441.207,181.978c14.852,14.845,52.875,43.618,59.24,63.032,10.111,30.838-32.092,58.819-45.863,72.581L337.059,435.059C313.649,458.457,294.512,484,263.487,500ZM51.369,500c-29.582.482-52.363-28.6-33.442-55.391L206.158,256.47,17.927,68.331C6.106,36.252,27.171-5.45,64.746,17.715l167.21,167.128c14.582,14.575,52.2,42.833,57.329,63.032,7.324,28.864-33.667,56.573-47.774,70.671q-59.235,59.205-118.48,118.423C100.446,459.542,81.853,485.235,51.369,500Z"/>
         </svg>
      </div>
   );
};
export default IconChevronRight;
