import React, { Component } from 'react';

const IconRowInsert = ({ classes }) => {
	const allClasses = classes + ' bg-burnt-orange';
	return <div className={allClasses} />;
};

export default IconRowInsert;

// { style = {}, width = '100%', height = '1em', classes = '', viewBox = '0 0 124 124' }
// classes text-light-blue hover:text-vibrant-blue
// <div className={allClasses}>
// 	<svg
// 		style={style}
// 		height={height}
// 		width={width}
// 		viewBox={viewBox}
// 		className="fill-current"
// 		xmlns="http://www.w3.org/2000/svg"
// 	>
// 		<path d="M6,123.15h112c3.3,0,6-2.7,6-6v-12c0-3.3-2.7-6-6-6H6c-3.3,0-6,2.7-6,6v12C0,120.45,2.6,123.15,6,123.15z" />
// 		<path d="M70.4,0.85H53.5c-3.4,0-6.2,2.8-6.2,6.2v25c0,3.4-2.8,6.2-6.2,6.2H30.3c-5.2,0-8.1,6-4.9,10.1l31.1,40c2.5,3.199,7.4,3.199,9.9,0l32-40c3.199-4.1,0.3-10.1-5-10.1H82.8c-3.399,0-6.2-2.8-6.2-6.2v-25C76.6,3.65,73.8,0.85,70.4,0.85z" />
// 	</svg>
// </div>
