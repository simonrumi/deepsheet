import { isSomething } from '.';
import {floatingCellNumber } from './dataStructureHelpers';

export const FLOATING_CELL_KEY_PREFIX = 'floating_cell_';

export const createFloatingCellKey = floatingCellNumber => FLOATING_CELL_KEY_PREFIX + floatingCellNumber;

export const isFloatingCellTest = cell => isSomething(floatingCellNumber(cell));