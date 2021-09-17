import React from 'react';

const IconCopy = ({
   style = {},
   width = '100%',
   height = '100%',
   classes = '',
   svgClasses = '',
   viewBox = '0 0 512 512',
   onClickFn,
   onMouseDownFn,
   copiedRange,
}) => {
    const allSvgClasses = 'fill-current ' + svgClasses;
    const colorClasses = copiedRange ? 'text-burnt-orange' : 'text-subdued-blue hover:text-vibrant-blue';
    const copyIconClasses = 'cursor-pointer w-6 flex-1 mb-1 ' + colorClasses;
    return (
    <div className={copyIconClasses} onClick={onClickFn} onMouseDown={onMouseDownFn}>
            <svg
                style={style}
                height={height}
                width={width}
                viewBox={viewBox}
                className={allSvgClasses}
                xmlns="http://www.w3.org/2000/svg">
                <path d="M366.905,108.016h-141.91c-11.048,0-20.003,8.955-20.003,20.003s8.955,20.003,20.003,20.003h141.91
                    c11.048,0,20.003-8.955,20.003-20.003S377.952,108.016,366.905,108.016z"/>

                <path d="M366.905,188.027h-141.91c-11.048,0-20.003,8.955-20.003,20.003s8.955,20.003,20.003,20.003h141.91
                    c11.047,0,20.003-8.955,20.003-20.003S377.953,188.027,366.905,188.027z"/>

                <path d="M286.004,268.039h-61.009c-11.048,0-20.003,8.955-20.003,20.003c0,11.048,8.955,20.003,20.003,20.003h61.009
                    c11.048,0,20.003-8.955,20.003-20.003C306.007,276.994,297.052,268.039,286.004,268.039z"/>

                <path d="M448.028,272.039c11.048,0,20.003-8.955,20.003-20.003V80.012C468.031,35.893,432.137,0,388.019,0H203.992
                    c-44.094,0-79.971,35.853-80.012,79.938c-44.118,0-80.012,35.893-80.012,80.012v272.039c0,44.118,35.893,80.012,80.012,80.012
                    h194.028c44.118,0,80.012-35.893,80.012-80.012v-0.608c39.414-4.938,70.01-38.662,70.01-79.389
                    c0-11.048-8.955-20.003-20.003-20.003c-11.048,0-20.003,8.955-20.003,20.003c0,22.054-17.942,40.001-39.996,40.006l-184.027,0.045
                    h-0.009c-10.685,0-20.73-4.16-28.285-11.715c-7.558-7.556-11.721-17.604-11.721-28.291V80.012
                    c0-22.059,17.947-40.006,40.006-40.006H388.02c22.059,0,40.006,17.947,40.006,40.006v172.025
                    C428.025,263.084,436.98,272.039,448.028,272.039z M203.992,432.047h0.02l154.002-0.038
                    c-0.012,22.049-17.954,39.984-40.006,39.984H123.981c-22.059,0-40.006-17.947-40.006-40.006V159.948
                    c0-22.059,17.947-40.006,40.006-40.006v232.094c0,21.375,8.325,41.471,23.441,56.583
                    C162.535,423.729,182.622,432.047,203.992,432.047z"/>

            </svg>
        </div>
    );
};

export default IconCopy;
