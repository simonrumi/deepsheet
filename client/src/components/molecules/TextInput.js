import React from 'react';
import * as R from 'ramda';
//import ErrorText from '../atoms/ErrorText';

const TextInput = props => {
	const { changeHandler, value = '', error = '', classes = '' } = props.props;
	const borderColor = error ? ' border-vibrant-burnt-orange' : ' border-light-light-blue';
	const baseClasses =
		classes +
		' shadow-none appearance-none border rounded w-full py-2 px-3 text-grey-blue leading-tight focus:outline-none focus:shadow ';

	return (
		<div className="w-full px-2">
			<input
				className={R.concat(baseClasses, borderColor)}
				type="text"
				value={value} 
				onChange={changeHandler} 
				error={error}
			/>
		</div>
	);
};

export default TextInput;
