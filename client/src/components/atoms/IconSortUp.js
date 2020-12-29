import React from 'react';
import { TOOL_ICON_WIDTH, TOOL_ICON_HEIGHT, } from '../../constants';

const SortUpIcon = ({
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
            <path d="m366.996094 512c-11.046875 0-20-8.953125-20-20v-316.007812h-85.992188c-15.777344 0-29.894531-9.433594-35.96875-24.035157-6.097656-14.660156-2.8125-31.398437 8.367188-42.648437l91.09375-91.632813c11.332031-11.398437 26.425781-17.675781 42.5-17.675781 16.074218 0 31.167968 6.277344 42.5 17.675781l91.09375 91.632813c11.183594 11.246094 14.46875 27.988281 8.371094 42.648437-6.074219 14.601563-20.195313 24.035157-35.972657 24.035157h-21.988281c-11.046875 0-20-8.953126-20-20 0-11.046876 8.953125-20 20-20h19.710938l-89.582032-90.113282c-3.769531-3.789062-8.785156-5.878906-14.132812-5.878906-5.34375 0-10.363282 2.089844-14.132813 5.878906l-89.582031 90.113282h83.714844c22.058594 0 40 17.945312 40 40v316.007812c0 11.042969-8.953125 20-20 20zm0 0"/>
         </svg>
      </div>
   );
};

export default SortUpIcon;