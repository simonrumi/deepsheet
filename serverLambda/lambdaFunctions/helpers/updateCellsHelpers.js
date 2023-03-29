const R = require('ramda');
const { isSomething, isNothing, arrayContainsSomething } = require('./index');

const findCellByRowAndColumn = R.curry((row, column, cellsArr) => {
   return R.find(cell => R.propEq('row', row, cell) && R.propEq('column', column, cell))(cellsArr);
});

const updateAndAddCells = (sheetDoc, updatedCells) => {
	const updatedExistingCells = R.pipe(
		R.prop,
		R.map(cell => {
			const updatedCell = findCellByRowAndColumn(cell.row, cell.column, updatedCells);
			return isSomething(updatedCell) ? updatedCell : cell; 
		})
	)('cells', sheetDoc);

   const addedCells = R.filter(
		cell => R.pipe(
			findCellByRowAndColumn, 
			isNothing
		)(cell.row, cell.column, updatedExistingCells)
	)(updatedCells);

   return isSomething(updatedExistingCells)
      ? isSomething(addedCells)
         ? R.concat(updatedExistingCells, addedCells)
         : updatedExistingCells
      : isSomething(addedCells)
         ? addedCells
         : null;
};

// this has a very specific use in two reducers below
const giveNewNumberToNextFloatingCell = accumulator => ({
	...accumulator,
	updatedFloatingCells: R.pipe(
		R.head,
		R.assoc('number', accumulator.nextNumber),
		R.append(R.__, accumulator.updatedFloatingCells)
	)(accumulator.remainingFloatingCellsToAdd),
	remainingFloatingCellsToAdd: R.tail(accumulator.remainingFloatingCellsToAdd),
	nextNumber: accumulator.nextNumber + 1,
});

/* 
 This will add all the provided floating cells, even if some of them have numbers that are the same as already existing cells.
 when that happens, we'll update the numbers for the added cells, either by finding "holes" in the current set of floating cell numbers,
 or, failiing that, adding numbers that are greater than any existing numbers
 */
const addNewFloatingCells = (sheetDoc, addedFloatingCells) => {
	console.log('updateCellsHelpers--addNewFloatingCells got addedFloatingCells', addedFloatingCells);
	// go through all the floating cells and if the number already exists,
	// make the new floating cell the next available number
	const existingFloatingCells = R.prop('floatingCells', sheetDoc);
	return R.pipe(
		R.tap(data => console.log('updateCellsHelpers--addNewFloatingCells started outer pipe with addedFloatingCells', data)),
		R.reduce(
			(accumulator, addedFloatingCell) => {
				const addedCellAlreadyExisting = R.find(
               exsitingFloatingCell => exsitingFloatingCell.number === addedFloatingCell.number,
               existingFloatingCells
            );
				return addedCellAlreadyExisting 
					? {
						...accumulator,
						cellsWithNumbersAlreadyUsed: R.append(addedFloatingCell, accumulator.cellsWithNumbersAlreadyUsed)
					} 
					: {
						...accumulator,
						cellsWithNewNumbers: R.append(addedFloatingCell, accumulator.cellsWithNewNumbers)
					};
			},
			{ cellsWithNumbersAlreadyUsed: [], cellsWithNewNumbers: []}, // these are what we are figuring out
		),
		R.tap(data => console.log('updateCellsHelpers--addNewFloatingCells after first reduce got', data)),
		({ cellsWithNumbersAlreadyUsed, cellsWithNewNumbers }) => R.pipe(
			R.tap(data => console.log('updateCellsHelpers--addNewFloatingCells started inner pipe with existingFloatingCells', data, 'which will be concated with cellsWithNewNumbers', cellsWithNewNumbers)),
			// add the cells with new numbers to the existing cells
			R.concat(cellsWithNewNumbers),

			// sort the floating cells (which don't yet include cellsWithNumbersAlreadyUsed)
			R.sort(
				(floatingCell1, floatingCell2) => parseInt(floatingCell1.number) < parseInt(floatingCell2.number) 
					? -1
					: parseInt(floatingCell1.number) > parseInt(floatingCell2.number) ? 1 : 0
			),
			// find "holes" within the sorted cells to put some/all of the cellsWithNumbersAlreadyUsed
			sortedFloatingCells => R.reduce(
				(accumulator, existingFloatingCell) => {
					if (parseInt(existingFloatingCell.number) === accumulator.nextNumber) {
						return ({ ...accumulator, nextNumber: accumulator.nextNumber + 1 });
					}
					
					const updatedAccumulator = giveNewNumberToNextFloatingCell(accumulator);
					return updatedAccumulator.remainingFloatingCellsToAdd.length > 0 
						?	updatedAccumulator
						: R.reduced(updatedAccumulator);
				}, 
				{ nextNumber: 0, remainingFloatingCellsToAdd: cellsWithNumbersAlreadyUsed, updatedFloatingCells: sortedFloatingCells },
				sortedFloatingCells
			),
			({ nextNumber, remainingFloatingCellsToAdd, updatedFloatingCells }) => R.reduce(
				(accumulator, floatingCellToAdd) => giveNewNumberToNextFloatingCell(accumulator), //don't need floatingCellToAdd because it is retrieved from accumulator.remainingFloatingCellsToAdd
				{ remainingFloatingCellsToAdd, nextNumber, updatedFloatingCells },
				remainingFloatingCellsToAdd
			),
			R.prop('updatedFloatingCells')
		)(existingFloatingCells)
	)(addedFloatingCells);
}

/* If we're asked to update any cells that don't exist already, we will add those as new cells by calling addNewFloatingCells (see above) */
const updateExistingFloatingCells = (sheetDoc, updatedFloatingCells) => {
	const { remainingUpdatedFloatingCells, allFloatingCells } = R.reduce(
		(accumulator, existingFloatingCell) => {
			console.log('updateCellHelpers--updateExistingFloatingCells reduce start with existingFloatingCell', existingFloatingCell, 'accumulator', accumulator)
			const updatedFloatingCellIndex = R.findIndex(updatedFloatingCell => updatedFloatingCell.number === existingFloatingCell.number, accumulator.remainingUpdatedFloatingCells);
			return updatedFloatingCellIndex === -1 
				? {
					...accumulator,
					allFloatingCells: R.append(existingFloatingCell, accumulator.allFloatingCells)
				} 
				// the current existingFloatingCell was one of the updated floating cells, so add the updated version to allFloatingCells, and remove it from remainingUpdatedFloatingCells
				: {
					remainingUpdatedFloatingCells: R.remove(updatedFloatingCellIndex, 1, accumulator.remainingUpdatedFloatingCells),
					allFloatingCells: R.append(R.prop(updatedFloatingCellIndex, accumulator.remainingUpdatedFloatingCells), accumulator.allFloatingCells)
				}
		},
		{ remainingUpdatedFloatingCells: updatedFloatingCells, allFloatingCells: [] },
		sheetDoc?.floatingCells
	);
	if (arrayContainsSomething(remainingUpdatedFloatingCells)) {
		const updatedSheetDoc = R.assoc('floatingCells', allFloatingCells, sheetDoc);
		console.log('updateCellHelpers--updateExistingFloatingCells will call addNewFloatingCells with these remainingUpdatedFloatingCells', remainingUpdatedFloatingCells);
		return addNewFloatingCells(updatedSheetDoc, remainingUpdatedFloatingCells);
	}
	console.log('updateCellHelpers--updateExistingFloatingCells will return allFloatingCells', allFloatingCells);
	return allFloatingCells;
}

const deleteSubsheetId = ({ originalCells, row, column, formattedText }) =>
   R.map(cell => {
      if (cell.row === row && cell.column === column) {
         const newContent = { ...cell.content, subsheetId: null, formattedText };
         return { ...cell, content: newContent };
      }
      return cell;
   })(originalCells);

const updateParentWithSubsheetTitle = (parentSheet, subsheet) => R.map(
   parentCell => JSON.stringify(parentCell.content.subsheetId) === JSON.stringify(subsheet._id)
      ? { ...parentCell, content: { ...parentCell.content, text: subsheet.title } }
      : parentCell,
   parentSheet.cells
);

module.exports = {
   findCellByRowAndColumn,
   updateAndAddCells,
	addNewFloatingCells,
	updateExistingFloatingCells,
   deleteSubsheetId,
   updateParentWithSubsheetTitle,
};
