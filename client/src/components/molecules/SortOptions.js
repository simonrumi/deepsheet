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
import { updatedSortOptions, sortedAxis } from '../../actions';
import { toggledShowSortModal } from '../../actions/sortActions';
import { startedUndoableAction, completedUndoableAction } from '../../actions/undoActions';
import SortUpIcon from '../atoms/IconSortUp';
import SortDownIcon from '../atoms/IconSortDown';
import RadioButton from '../atoms/RadioButton';

const SortOptions = props => {
   const { classes, rowIndex, columnIndex } = props;
   const [sortType, setSortType] = useState('SORT_TYPE_TEXT');

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
      const nonClickableTextClasses = 'text-grey-blue pl-2';
      
      return (
         <div className={parentClasses}>
            <Label label="Sort" />
            <div className="flex flex-col items-end justify-evenly px-2 py-2 w-3/4">
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
               <div className={rowClasses}>
                  <RadioButton changeHandler={onClickSortText} value={sortType === SORT_TYPE_TEXT} />
                  <span className={nonClickableTextClasses}>sort as text</span>
               </div>
               <div className={rowClasses}>
                  <RadioButton changeHandler={onClickSortNumbers} value={sortType === SORT_TYPE_NUMBERS} />
                  <span className={nonClickableTextClasses}>sort as numbers</span>
               </div>
               <div className={rowClasses}>
                  <RadioButton changeHandler={onClickSortDates} value={sortType === SORT_TYPE_DATES} />
                  <span className={nonClickableTextClasses}>sort as dates</span>
               </div>
            </div>
         </div>
      );
   } 
   // note that the magic number for the marginLeft style for the "low to high" text is to make the up and down arrows line up directly above each other
   // it is needed because the IconSortDown and IconSortUp svgs were made by splitting up IconSort...but the positioning of each within their viewbox is note even
   // the value for marginLeft is also dependent on the constants TOOL_ICON_WIDTH and TOOL_ICON_HEIGHT (which are both 2em), which are used within the icons' components
   // it's fiddly and a bit hokey but this seems like an exception that will just need to be managed as such

   return render();
}

export default SortOptions;
