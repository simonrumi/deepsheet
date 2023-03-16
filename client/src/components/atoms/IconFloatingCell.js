import React from 'react';

const IconFloatingCell = ({ style = {}, width = '100%', height = '100%', classes = '', onClickFn }) => {
	const allClasses = 'text-subdued-blue hover:text-vibrant-blue cursor-pointer justify-center content-center' + classes;
	return (
		<div className={allClasses} onClick={onClickFn}>
			<svg
				style={style}
				height={height}
				width={width}
				viewBox="0 0 512.000000 512.000000"
				preserveAspectRatio="xMidYMid meet"
				className="fill-current"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" stroke="none">
					<path d="M3062 5113 c-31 -12 -42 -61 -42 -193 l0 -130 -35 0 c-22 0 -43 -8
					-55 -20 -19 -19 -20 -33 -20 -240 l0 -219 -366 -3 -366 -3 -19 -24 c-18 -22
					-19 -43 -19 -347 l0 -324 -310 0 -310 0 0 120 c0 66 -5 130 -11 143 -13 29
					-48 47 -88 47 l-29 0 -4 83 c-6 136 -69 230 -194 289 l-64 30 0 227 c0 205 -2
					229 -17 243 -28 23 -50 28 -82 17 -45 -16 -51 -48 -51 -284 l0 -212 -37 -11
					c-52 -16 -122 -70 -156 -120 -38 -54 -57 -112 -64 -193 l-6 -67 -41 -5 c-80
					-11 -76 19 -76 -576 l0 -527 -66 -29 c-134 -58 -247 -200 -274 -344 -26 -139
					4 -459 65 -702 51 -201 153 -450 252 -612 34 -56 35 -60 18 -70 -78 -43 -172
					-170 -201 -271 -17 -61 -20 -65 -54 -71 -163 -31 -335 -223 -335 -376 0 -49 4
					-63 30 -95 58 -71 71 -74 333 -74 l233 0 24 25 c30 30 32 64 4 99 l-20 26
					-225 0 c-253 0 -249 -2 -216 73 44 99 146 173 255 184 74 8 94 27 102 100 20
					176 159 303 330 303 171 0 310 -124 333 -298 13 -94 17 -96 190 -103 124 -5
					155 -9 200 -29 62 -27 132 -100 151 -158 25 -76 48 -72 -389 -72 -377 0 -391
					-1 -410 -20 -12 -12 -20 -33 -20 -55 0 -22 8 -43 20 -55 19 -19 33 -20 388
					-20 l368 0 82 -30 c824 -301 1751 -107 2386 500 l94 90 363 0 c336 0 367 2
					406 19 103 47 127 164 62 301 -62 129 -155 215 -278 256 -61 21 -67 26 -78 61
					-18 61 -15 86 26 211 65 196 103 404 117 638 4 67 4 134 0 148 -10 42 -52 56
					-171 56 l-105 0 0 433 c0 358 -2 437 -14 453 -14 18 -33 19 -383 24 l-368 5
					-5 340 c-3 187 -7 341 -8 341 -57 34 -114 22 -131 -28 -8 -21 -11 -282 -11
					-799 l0 -769 -305 0 -305 0 0 1110 0 1110 305 0 305 0 0 -134 c0 -73 5 -147
					11 -164 12 -34 56 -58 88 -47 49 15 51 23 51 246 0 196 -1 210 -20 229 -12 12
					-33 20 -54 20 l-35 0 -3 146 c-4 201 27 184 -342 183 -160 0 -297 -3 -304 -6z
					m498 -233 l0 -90 -192 2 -193 3 -3 88 -3 87 196 0 195 0 0 -90z m-2433 -721
					c34 -13 80 -55 99 -91 8 -15 14 -54 14 -88 l0 -60 -186 0 -187 0 6 59 c10 115
					82 191 179 191 26 0 59 -5 75 -11z m1781 -872 l2 -867 -216 2 -215 3 -28 72
					c-28 70 -98 179 -140 217 l-21 19 0 714 0 713 308 -2 307 -3 3 -868z m-1538
					133 c0 -192 -3 -350 -7 -350 -5 1 -33 9 -63 20 -179 63 -375 -31 -451 -216
					-19 -46 -26 -54 -44 -50 -11 3 -28 6 -37 6 -17 0 -18 29 -18 470 l0 470 310 0
					310 0 0 -350z m768 -269 c2 -286 1 -303 -15 -298 -10 3 -50 17 -89 31 -141 51
					-260 56 -476 20 l-38 -7 0 282 0 281 308 -2 307 -3 3 -304z m2302 -351 l0
					-380 -307 2 -308 3 -3 378 -2 377 310 0 310 0 0 -380z m-3187 149 c57 -16 113
					-71 137 -137 25 -67 45 -92 73 -92 11 0 55 12 96 27 68 25 90 28 206 28 117 0
					138 -3 210 -28 147 -52 258 -145 321 -269 13 -26 24 -50 24 -53 0 -3 -430 -5
					-955 -5 -667 0 -955 3 -955 11 0 5 11 34 25 64 70 147 245 219 403 166 35 -12
					72 -19 83 -16 23 8 49 54 49 88 0 47 30 123 62 156 61 63 137 84 221 60z
					m3463 -771 c-14 -180 -38 -313 -88 -485 l-21 -72 -56 44 c-111 87 -236 122
					-368 104 -190 -26 -358 -186 -405 -386 l-12 -51 -201 -4 c-176 -4 -207 -7
					-256 -26 -85 -34 -147 -80 -195 -144 -91 -124 -116 -263 -62 -346 53 -79 38
					-76 535 -82 l442 -5 -89 -75 c-410 -341 -933 -519 -1460 -497 -204 9 -354 34
					-553 92 -53 15 -56 18 -46 37 20 37 6 130 -31 204 -79 161 -227 243 -440 244
					l-76 0 -12 45 c-21 78 -54 136 -114 200 -98 105 -222 157 -367 154 l-85 -2
					-27 39 c-80 116 -192 366 -242 539 -46 162 -87 412 -87 537 l0 28 2161 0 2162
					0 -7 -92z m-353 -575 c110 -35 211 -173 224 -306 8 -91 23 -108 103 -118 83
					-12 143 -43 196 -102 42 -47 88 -145 82 -176 -3 -14 -86 -16 -878 -19 -481 -1
					-885 0 -897 3 -17 4 -23 13 -23 33 0 44 53 144 98 184 75 68 90 71 360 77 283
					7 274 3 286 112 11 92 41 162 97 223 96 105 210 134 352 89z"/>
					<path d="M2041 1949 c-94 -18 -194 -102 -232 -193 l-22 -54 -73 -11 c-132 -20
					-213 -73 -263 -173 -18 -34 -31 -77 -31 -97 0 -45 30 -95 72 -121 32 -19 52
					-20 568 -20 516 0 536 1 568 20 39 24 72 75 72 111 0 41 -27 108 -63 155 -35
					47 -129 114 -159 114 -13 0 -24 12 -34 38 -49 125 -126 197 -241 227 -63 16
					-95 17 -162 4z m134 -150 c73 -20 135 -106 135 -186 0 -33 32 -60 81 -68 24
					-4 56 -13 70 -21 28 -14 79 -69 79 -85 0 -5 -193 -9 -480 -9 -522 0 -503 -2
					-458 55 32 40 81 56 191 63 89 4 100 7 117 30 11 14 20 38 20 54 0 67 55 138
					126 163 48 17 68 18 119 4z"/>
				</g>
			</svg>
		</div>
	);
};

export default IconFloatingCell;