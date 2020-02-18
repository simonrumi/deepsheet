import React from 'react';

const IconCheckmark = ({
	style = {},
	width = '100%',
	height = '100%',
	classes = '',
	viewBox = '0 0 611.99 611.99',
	onClickFn,
}) => {
	const allClasses = 'text-subdued-blue hover:text-vibrant-blue cursor-pointer ' + classes;
	return (
		<div className={allClasses} onClick={onClickFn}>
			<svg
				style={style}
				height={height}
				width={width}
				viewBox={viewBox}
				className="fill-current"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M589.105,80.63c-30.513-31.125-79.965-31.125-110.478,0L202.422,362.344l-69.061-70.438c-30.513-31.125-79.965-31.125-110.478,0c-30.513,31.125-30.513,81.572,0,112.678l124.29,126.776c30.513,31.125,79.965,31.125,110.478,0l331.453-338.033C619.619,162.202,619.619,111.755,589.105,80.63z" />
			</svg>
		</div>
	);
};

export default IconCheckmark;
