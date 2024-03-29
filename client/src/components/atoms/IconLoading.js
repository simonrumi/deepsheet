import React from 'react';

/*
the original viewbox was 480 x 480, but when rotating the large arrow head would get clipped
so by making the viewbox 640 x 640 the center can be shifted by 80,80
...the above 2 things are accomplished by these 4 values in viewbox
'-80 -80 640 640'
*/
const LoadingIcon = ({ style = {}, width = '100%', height = '100%', classes = '', viewBox = '-80 -80 640 640' }) => {
   const allClasses = 'text-subdued-blue ' + classes;
   return (
      <div className={allClasses}>
         <svg
            style={style}
            height={height}
            width={width}
            viewBox={viewBox}
            className="fill-current"
            xmlns="http://www.w3.org/2000/svg">
            <g>
               <path d="m32 320.004c-17.673 0-32-14.327-32-32s14.327-32 32-32 32 14.327 32 32c-.02 17.665-14.335 31.98-32 32zm0-48c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16c-.01-8.832-7.168-15.989-16-16z" />
               <path d="m176 464.004c-17.673 0-32-14.327-32-32s14.327-32 32-32 32 14.327 32 32c-.02 17.665-14.335 31.98-32 32zm0-48c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16c-.01-8.832-7.168-15.989-16-16z" />
               <path d="m85 411.004c-17.673 0-32-14.327-32-32s14.327-32 32-32 32 14.327 32 32c-.02 17.665-14.335 31.98-32 32zm0-48c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16c-.01-8.832-7.168-15.989-16-16z" />
               <path d="m32 208.004c-17.673 0-32-14.327-32-32s14.327-32 32-32 32 14.327 32 32c-.02 17.665-14.335 31.98-32 32zm0-48c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16c-.01-8.832-7.168-15.989-16-16z" />
               <path d="m176 64.004c-17.673 0-32-14.327-32-32s14.327-32 32-32 32 14.327 32 32c-.02 17.665-14.335 31.98-32 32zm0-48c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16c-.01-8.832-7.168-15.989-16-16z" />
               <path d="m85 117.004c-17.673 0-32-14.327-32-32s14.327-32 32-32 32 14.327 32 32c-.02 17.665-14.335 31.98-32 32zm0-48c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16c-.01-8.832-7.168-15.989-16-16z" />
               <path d="m440.03 480.004c-1.189-.001-2.378-.068-3.56-.2l-144-16c-17.565-1.951-30.223-17.772-28.272-35.337.189-1.701.514-3.383.972-5.032l40-144c4.727-17.026 22.361-26.997 39.388-22.27.004.001.008.002.012.003 17.028 4.73 26.998 22.369 22.268 39.397 0 .001 0 .002-.001.003l-21.028 75.7c12.681-9.511 24.031-20.677 33.748-33.2 23.756-30.62 36.585-68.309 36.443-107.064 0-77.945-52.965-147.536-128.8-169.233-16.974-4.921-26.745-22.671-21.824-39.645 4.896-16.888 22.501-26.662 39.424-21.887 49.622 14.372 93.421 44.085 125.118 84.88 77.22 99.495 63.762 241.885-30.732 325.15l44.345 4.928c17.567 1.938 30.236 17.75 28.298 35.316-1.789 16.214-15.487 28.487-31.799 28.491zm-104.056-208.008c-7.177.02-13.464 4.811-15.388 11.725l-40 144c-2.364 8.514 2.621 17.333 11.136 19.698.824.229 1.664.391 2.514.485l144 16c.598.066 1.199.1 1.8.1 8.837-.027 15.978-7.212 15.951-16.048-.025-8.127-6.138-14.945-14.214-15.852l-63.31-7.035c-4.391-.489-7.555-4.444-7.066-8.836.244-2.195 1.385-4.192 3.152-5.516 16.173-12.099 30.638-26.327 43-42.3 62.046-80.272 61.935-192.351-.269-272.5-29.608-38.111-70.524-65.869-116.88-79.293-8.475-2.503-17.374 2.338-19.876 10.813s2.338 17.374 10.813 19.877c.088.026.175.051.263.075 82.666 23.652 140.4 99.568 140.4 184.615.152 42.299-13.853 83.434-39.785 116.852-15.262 19.75-34.226 36.338-55.833 48.834-3.82 2.219-8.717.922-10.936-2.899-1.082-1.863-1.367-4.083-.791-6.159l26.762-96.346c2.366-8.514-2.618-17.334-11.132-19.7h-.001c-1.403-.391-2.853-.59-4.31-.59z" />
               <animate attributeName="x" from="0" to="60" dur="1s" repeatCount="3" />
               <animate attributeName="y" from="0" to="60" dur="1s" repeatCount="4" />
               <animateTransform
                  attributeName="transform"
                  type="rotate"
                  begin="0s"
                  dur="5s"
                  from="0 240 240"
                  to="360 240 240"
                  repeatCount="indefinite"
               />
            </g>
         </svg>
      </div>
   );
};

export default LoadingIcon;
