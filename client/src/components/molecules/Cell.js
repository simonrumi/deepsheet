import React, { useRef} from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import { focusedCell } from '../../actions/focusActions';
import { menuHidden } from '../../actions/menuActions';
import { nothing, isSomething, isNothing } from '../../helpers';
import { createCellId, isCellFocused, createCellKey } from '../../helpers/cellHelpers';
import { isCellVisible } from '../../helpers/visibilityHelpers';
import { cellSubsheetId, cellRow, cellColumn, cellText, statePresent} from '../../helpers/dataStructureHelpers';
import SubsheetCell from './SubsheetCell';
import CellInPlaceEditor from './CellInPlaceEditor';


const Cell = props => {
   const { row, column } = props.cell;
   const cellKey = createCellKey(row, column);
   const cellReducer = useSelector(state => statePresent(state)[cellKey]);
   const cellHasFocus = useSelector(state => isCellFocused(props.cell, state));

   const cellRef = useRef(null);

   const onCellClick = () => {
      focusedCell(cellReducer);
      menuHidden(); // in case the menu was showing, hide it
   }

   const createClassNames = classes => {
      const cellBaseClasses = 'grid-item text-dark-dark-blue border-t border-l ';
      const otherClasses = classes ? classes : '';
      return cellBaseClasses + otherClasses;
   };

   const renderRegularCell = cell => {
      const row = cellRow(cell);
      const column = cellColumn(cell);
      const text = cellText(cell);
      return (
         <div
            ref={cellRef}
            className={createClassNames(props.classes, cellHasFocus)}
            onClick={onCellClick}
            id={createCellId(row, column)}>
            {text}
         </div>
      );
   }

   const renderInPlaceEditor = cell => {
      const positioning = R.pick(['top', 'left', 'right', 'bottom', 'width', 'height'], cellRef.current.getBoundingClientRect());
      console.log('renderInPlaceEditor made positioning', positioning);
      return (
         <div>
            {renderRegularCell(cell)}
            <CellInPlaceEditor positioning={positioning} cell={cell} cellHasFocus={cellHasFocus} />
         </div>
      );
   }

   const renderBlankCell = cell => <div className={createClassNames(props.classes)} />;

   const renderSubsheetCell = cell => <SubsheetCell cell={cell} />;

   const renderCell = cellReducer => {
      return R.cond([
         [R.isNil, nothing],
         [R.pipe(isCellVisible, R.not), nothing],
         [R.thunkify(R.identity)(props.blankCell), renderBlankCell],
         [R.pipe(cellSubsheetId, isSomething), renderSubsheetCell],
         [R.thunkify(R.identity)(cellHasFocus), renderInPlaceEditor],
         [R.pipe(cellSubsheetId, isNothing), renderRegularCell],
      ])(cellReducer);
   };

   return renderCell(cellReducer);
}

export default Cell; 
