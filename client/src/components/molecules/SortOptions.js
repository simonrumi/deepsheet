import React, { useState } from 'react';
import Label from '../atoms/Label';
import {
   SORT_INCREASING,
   SORT_DECREASING,
   ROW_AXIS,
   COLUMN_AXIS,
   SORT_TYPE_TEXT,
   SORT_TYPE_NUMBERS,
   SORT_TYPE_DATES,
} from '../../constants';
import { toggledShowSortModal, sortedAxis, updatedSortOptions } from '../../actions/sortActions';
import { startedUndoableAction, completedUndoableAction } from '../../actions/undoActions';
import SortUpIcon from '../atoms/IconSortUp';
import SortDownIcon from '../atoms/IconSortDown';
import RadioButton from '../atoms/RadioButton';

const SortOptions = ({ classes, rowIndex, columnIndex }) => {
   const [sortType, setSortType] = useState(SORT_TYPE_TEXT);

   const onClickSortText = () => setSortType(SORT_TYPE_TEXT);
   const onClickSortNumbers = () => setSortType(SORT_TYPE_NUMBERS);
   const onClickSortDates = () => setSortType(SORT_TYPE_DATES);

   const onClickLowToHigh = () => {
      updatedSortOptions({
         rowSortByIndex: rowIndex,
         columnSortByIndex: columnIndex,
         sortDirection: SORT_INCREASING,
         sortType,
      });
      startedUndoableAction();
      sortedAxis();
      const axisName = rowIndex ? ROW_AXIS : COLUMN_AXIS
      completedUndoableAction('sorted A to Z for ' + axisName + ' ' + rowIndex || columnIndex);
      toggledShowSortModal();
   };

   const onClickHighToLow = () => {
      updatedSortOptions({
         rowSortByIndex: rowIndex,
         columnSortByIndex: columnIndex,
         sortDirection: SORT_DECREASING,
         sortType,
      });
      startedUndoableAction();
      sortedAxis();
      const axisName = rowIndex ? ROW_AXIS : COLUMN_AXIS
      completedUndoableAction('sorted Z to A for ' + axisName + ' ' + rowIndex || columnIndex);
      toggledShowSortModal();
   };

   const render = () => {
      const parentClasses = 'border border-solid border-grey-blue flex items-top justify-between p-2 ' + classes;
      const rowClasses = 'flex w-full justify-left pb-2'; // note that "row" here means a row within the modal box, nothing to do with a row in the spreadsheet
      const nonClickableTextClasses = 'text-dark-dark-blue pl-2';
      
      return (
         <div className={parentClasses}>
            <Label label="Sort" />
            <div className="flex flex-col items-end justify-evenly px-2 py-2 w-3/4">
               <div className={rowClasses}>
                  <RadioButton changeHandler={onClickSortText} isSelected={sortType === SORT_TYPE_TEXT} />
                  <span className={nonClickableTextClasses}>sort as text</span>
               </div>
               <div className={rowClasses}>
                  <RadioButton changeHandler={onClickSortNumbers} isSelected={sortType === SORT_TYPE_NUMBERS} />
                  <span className={nonClickableTextClasses}>sort as numbers</span>
               </div>
               <div className={rowClasses}>
                  <RadioButton changeHandler={onClickSortDates} isSelected={sortType === SORT_TYPE_DATES} />
                  <span className={nonClickableTextClasses}>sort as dates</span>
               </div>
               <hr className="border-grey-blue border-t w-full py-2" />
               <div className={rowClasses}>
                  <SortDownIcon onClickFn={onClickLowToHigh} />
                  <span className={nonClickableTextClasses} onClick={onClickLowToHigh}>
                     low to high
                  </span>
               </div>
               <div className={rowClasses}>
                  <SortUpIcon onClickFn={onClickHighToLow} />
                  <span
                     className={nonClickableTextClasses}
                     onClick={onClickHighToLow}>
                     high to low
                  </span>
               </div>
            </div>
         </div>
      );
   } 
   // note that the IconSortDown and IconSortUp svgs were made by splitting up IconSort...but the positioning of each within their viewbox is not even
   // so it's fiddly and a bit hokey to get them lined up vertically

   return render();
}

export default SortOptions;
