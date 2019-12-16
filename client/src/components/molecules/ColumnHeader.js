import React from 'react';
import { indexToColumnLetter } from '../../helpers';
import IconFilter from '../atoms/IconFilter';

const ColumnHeader = ({ index, totalColumns, classes, onFilterClick }) => {
	const columnLetter = indexToColumnLetter(index);
	const rightBorder = index === totalColumns - 1 ? ' border-r' : '';
	const allClasses = classes + rightBorder;

	return (
		<div className={allClasses} data-testid={'col' + index}>
			<div className="flex items-center justify-between px-1">
				<div className="flex-2">{columnLetter}</div>
				<IconFilter classes={'flex-1 h-3 w-3'} onClick={onFilterClick} />
			</div>
		</div>
	);
};

export default ColumnHeader;
