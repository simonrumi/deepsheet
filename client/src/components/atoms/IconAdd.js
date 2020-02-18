import React from 'react';

const IconAdd = ({ style = {}, width = '100%', height = '100%', classes = '', onClickFn }) => {
	const allClasses =
		'text-subdued-blue hover:text-vibrant-blue cursor-pointer justify-center content-center' + classes;
	return (
		<div className={allClasses} onClick={onClickFn}>
			<svg
				style={style}
				height={height}
				width={width}
				viewBox="0 0 46.361 46.361"
				className="fill-current"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M40.225,17.042H29.352V6.148c0-3.39-2.769-6.138-6.159-6.138c-3.389,0-6.157,2.748-6.157,6.138v10.895H6.139C2.75,17.042,0,19.79,0,23.18c0,3.391,2.75,6.139,6.139,6.139h10.897v10.896c0,3.39,2.768,6.138,6.157,6.138c3.39,0,6.159-2.748,6.159-6.138V29.318l10.873,0.002c3.389,0,6.137-2.75,6.137-6.141C46.361,19.79,43.613,17.042,40.225,17.042z" />
			</svg>
		</div>
	);
};

export default IconAdd;
