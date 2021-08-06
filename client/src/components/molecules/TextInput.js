import React from 'react';
import * as R from 'ramda';

const TextInput = props => {
	const { changeHandler, blurHandler, value = '', error = '', classes = '', testId } = props.props;
	const borderColor = error ? ' border-vibrant-burnt-orange' : ' border-dark-dark-blue';
	const baseClasses =
		classes +
		' shadow-none appearance-none border rounded w-full py-2 px-3 text-dark-dark-blue leading-tight focus:outline-none focus:shadow ';

	return (
		<div className="w-full px-2">
			<input
				className={R.concat(baseClasses, borderColor)}
				type="text"
				value={value} 
				onChange={changeHandler} 
				error={error}
            	onBlur={blurHandler}
				data-testid={testId}
			/>
		</div>
	);
};

export default TextInput;
