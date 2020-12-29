import React from 'react';
import { TOOL_ICON_WIDTH, TOOL_ICON_HEIGHT, } from '../../constants';

const SortDownIcon = ({
   style = {},
   classes = '',
   viewBox = '0 0 512 512',
   onClickFn,
}) => {
   const allClasses = 'text-subdued-blue hover:text-vibrant-blue cursor-pointer ' + classes;
   return (
      <div className={allClasses} onClick={onClickFn}>
         <svg
            style={style}
            width={TOOL_ICON_WIDTH}
            height={TOOL_ICON_HEIGHT}
            viewBox={viewBox}
            className="fill-current"
            xmlns="http://www.w3.org/2000/svg">
            <path d="m144.988281 512c-16.074219 0-31.167969-6.277344-42.5-17.675781l-91.09375-91.632813c-11.183593-11.25-14.46875-27.988281-8.367187-42.648437 6.070312-14.601563 20.191406-24.039063 35.96875-24.039063h85.992187v-316.003906c0-11.046875 8.953125-20 20-20s20 8.953125 20 20v316.007812c0 22.054688-17.945312 40-40 40h-83.714843l89.582031 90.113282c3.769531 3.789062 8.789062 5.878906 14.132812 5.878906s10.363281-2.089844 14.132813-5.878906l89.582031-90.113282h-19.710937c-11.046876 0-20-8.953124-20-20 0-11.046874 8.953124-20 20-20h21.988281c15.777343 0 29.894531 9.433594 35.96875 24.035157 6.097656 14.660156 2.816406 31.402343-8.367188 42.648437l-91.09375 91.632813c-11.332031 11.398437-26.425781 17.675781-42.5 17.675781zm0 0"/>
         </svg>
      </div>
   );
};

export default SortDownIcon;