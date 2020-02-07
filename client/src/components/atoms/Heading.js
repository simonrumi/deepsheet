import React from 'react';

const Heading = ({ text }) => {
	return (
		<h1 className="text-3xl text-subdued-blue" key="heading">
			{text}
		</h1>
	);
};

export default Heading;
