import React from 'react';

const CheckmarkSubmitIcon = ({
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
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="m369.164062 174.769531c7.8125 7.8125 7.8125 20.476563 0 28.285157l-134.171874 134.175781c-7.8125 7.808593-20.472657 7.808593-28.285157 0l-63.871093-63.875c-7.8125-7.808594-7.8125-20.472657 0-28.28125 7.808593-7.8125 20.472656-7.8125 28.28125 0l49.730468 49.730469 120.03125-120.035157c7.8125-7.808593 20.476563-7.808593 28.285156 0zm142.835938 81.230469c0 141.503906-114.515625 256-256 256-141.503906 0-256-114.515625-256-256 0-141.503906 114.515625-256 256-256 141.503906 0 256 114.515625 256 256zm-40 0c0-119.394531-96.621094-216-216-216-119.394531 0-216 96.621094-216 216 0 119.394531 96.621094 216 216 216 119.394531 0 216-96.621094 216-216zm0 0"/>
			</svg>
		</div>
	);
};

export default CheckmarkSubmitIcon;