import * as R from 'ramda';
import { isSomething, optimizeModalPositioning } from '.';
import {floatingCellNumber } from './dataStructureHelpers';
import { CELL_EDITOR_HORIZONTAL_MARGIN, CELL_EDITOR_VERTICAL_MARGIN } from '../constants';

export const createFloatingCellKey = floatingCellNumber => 'floating_cell_' + floatingCellNumber;

export const isFloatingCellTest = cell => isSomething(floatingCellNumber(cell));