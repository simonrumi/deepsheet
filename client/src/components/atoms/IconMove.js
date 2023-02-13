import React from 'react';

// note that the fill color had to be hard coded into the paths. it is the subdued blue color

const IconMove = ({
   style = {},
   width = '100%',
   height = '100%',
   classes = '',
   viewBox = '0 0 700 700',
   onClickFn,
   onMouseDownFn = () => {},
	onMouseUpFn = () => {}
}) => {
   const allClasses = 'text-subdued-blue hover:text-vibrant-blue cursor-pointer ' + classes;
   return (
      <div className={allClasses} onClick={onClickFn} onMouseDown={onMouseDownFn} onMouseUp={onMouseUpFn}>
         <svg
				version="1.0"
            style={style}
            height={height}
            width={width}
            viewBox={viewBox}
            className="fill-current"
            xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(0.000000,700.000000) scale(0.100000,-0.100000)" fill="#000000">
					<path fill="#32a8b8" d="M3022 6071 c-238 -240 -446 -453 -462 -474 -54 -72 -53 -203 2 -282
50 -70 131 -126 194 -132 75 -8 137 4 179 35 21 15 83 71 138 125 56 53 106
97 113 97 31 0 33 -31 36 -536 3 -563 -3 -502 63 -595 11 -15 43 -45 70 -66
49 -37 51 -38 141 -38 71 0 95 4 115 18 13 10 38 27 56 38 17 11 41 35 52 52
11 18 28 43 38 56 17 23 18 64 21 537 4 629 -9 591 144 442 171 -167 165 -163
277 -163 l96 0 52 39 c79 60 121 121 129 188 9 78 -2 139 -34 184 -15 21 -225
235 -466 476 l-440 438 -40 -2 c-40 -1 -52 -12 -474 -437z"></path>
					<path fill="#32a8b8" d="M1479 4470 c-19 -5 -59 -25 -87 -44 -29 -19 -244 -228 -477 -463
-411 -414 -425 -429 -425 -466 0 -37 12 -50 313 -354 171 -173 362 -365 422
-427 61 -61 135 -129 165 -150 54 -39 56 -40 145 -40 75 -1 96 2 119 19 16 11
40 28 54 37 15 10 43 46 64 80 35 58 38 69 38 138 0 69 -3 80 -35 130 -19 30
-77 99 -130 152 -52 53 -95 101 -95 107 0 5 6 13 13 18 6 4 244 10 528 13 474
5 517 6 540 23 13 10 38 27 56 38 17 11 41 35 52 52 11 18 28 43 38 56 12 17
17 44 17 105 1 78 0 83 -39 143 -22 34 -48 65 -58 68 -9 4 -30 17 -46 30 -15
13 -48 29 -72 34 -26 6 -235 11 -521 11 -420 0 -478 2 -492 16 -9 8 -16 17
-16 18 0 2 46 50 103 108 139 144 159 178 160 276 1 73 -1 80 -38 137 -71 108
-188 162 -296 135z"></path>
					<path fill="#32a8b8" d="M5390 4467 c-88 -30 -177 -122 -200 -208 -18 -65 -4 -142 33 -195 18
-25 76 -90 130 -146 53 -56 97 -103 97 -104 0 -1 -7 -10 -16 -18 -14 -14 -71
-16 -483 -16 -258 0 -491 -4 -519 -10 -45 -8 -141 -62 -151 -83 -1 -5 -18 -28
-37 -52 -27 -35 -35 -57 -40 -107 -11 -113 21 -175 142 -273 l37 -30 526 -5
c289 -3 527 -7 527 -8 18 -25 7 -42 -81 -131 -52 -53 -103 -108 -113 -122 -9
-15 -26 -39 -37 -55 -16 -22 -20 -44 -20 -109 0 -78 2 -83 39 -137 41 -60 98
-112 141 -128 34 -13 156 -13 190 0 56 21 69 34 678 647 269 272 277 281 277
320 0 39 -8 48 -439 479 -242 241 -453 450 -471 463 -52 39 -140 51 -210 28z"></path>
					<path fill="#32a8b8" d="M3461 2792 c-60 -4 -146 -65 -197 -138 l-39 -58 -3 -510 c-2 -348 -6
-514 -14 -523 -15 -18 -45 -16 -56 3 -23 41 -173 178 -229 209 -53 31 -70 35
-130 35 -63 0 -74 -3 -129 -39 -39 -25 -74 -59 -100 -96 -38 -56 -39 -60 -39
-144 0 -125 -52 -64 620 -731 305 -302 319 -315 355 -315 36 0 48 10 178 140
77 77 270 269 429 426 160 157 298 298 308 315 10 16 28 39 39 52 18 20 21 37
21 117 0 83 -3 97 -23 122 -12 15 -30 39 -39 53 -9 14 -44 42 -78 63 -56 34
-68 37 -136 37 -68 0 -79 -3 -129 -35 -30 -19 -99 -79 -153 -132 -82 -83 -100
-96 -115 -87 -16 10 -17 52 -22 526 l-5 514 -40 59 c-69 100 -159 145 -274
137z"></path>
				</g>
         </svg>
      </div>
   );
};

export default IconMove;