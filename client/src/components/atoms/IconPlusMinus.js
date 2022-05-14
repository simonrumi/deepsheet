import React from 'react';
import IconRightArrow from './IconRightArrow';

const IconPlusMinus = ({
   isExpanded = false,
	canExpand = false,
	isTopLevel = false,
   width = '100%',
   height = '100%',
   classes = '',
   onClickFn,
}) => {
	const allClasses = 'text-dark-dark-blue hover:text-vibrant-purple cursor-pointer ' + classes;
	return canExpand
		? (<span className={allClasses} onClick={onClickFn}>{ isExpanded ? '-' : '+'}</span>)
		: isTopLevel
			? (<span className={classes} height={height} width={width}> </span>)
			: (<IconRightArrow classes={'text-grey-blue ' + classes} height={height} width={width} />)
}

export default IconPlusMinus;