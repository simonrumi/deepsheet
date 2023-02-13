import React from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { stateFloatingCellKeys } from '../../helpers/dataStructureHelpers';
import FloatingCell from './FloatingCell';
import { log } from '../../clientLogger';
import { LOG } from '../../constants';

const FloatingCells = () => {
	log({ level: LOG.DEBUG }, '***FloatingCells started');
	const floatingCellKeys = stateFloatingCellKeys(managedStore.state);
	return R.map(
		floatingCellKey => <FloatingCell floatingCellKey={floatingCellKey} key={floatingCellKey}/>, 
		floatingCellKeys
	);
}

export default FloatingCells;