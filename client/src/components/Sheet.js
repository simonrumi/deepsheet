import * as R from 'ramda';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { triggeredFetchSheet } from '../actions/sheetActions';
import { isNothing } from '../helpers';
import {
   stateIsLoggedIn,
   stateShowLoginModal,
   stateSheetId,
   stateShowFilterModal,
   stateSheetIsCallingDb,
   stateMetadata,
   stateSheetCellsLoaded,
   stateSheetErrorMessage,
} from '../helpers/dataStructureHelpers';
import {
   getRequiredNumItemsForAxis,
   isVisibilityCalcutated,
} from '../helpers/visibilityHelpers';
import { getUserInfoFromCookie } from '../helpers/userHelpers';
import { ROW_AXIS, COLUMN_AXIS, THIN_COLUMN, ROW_HEIGHT } from '../constants';
import LoadingIcon from './atoms/IconLoading';
import Header from './Header';
import Editor from './organisms/Editor';
import Cells from './Cells';
import FilterModal from './organisms/FilterModal';
import LoginModal from './organisms/LoginModal';
import managedStore from  '../store';

// TODO BUG NEXT - updating when the session has expired is not handled - need to log user in then complete action

console.log('TODO: XSS defence: validate all the user input - must avoid having javascript entered into a cell, for example');
// XSS attacks are when javascript is entered into fields and then executed by the app
// must avoid this by escaping or URL encoding on both client and server
// URL encode or escape content being sent from front end
/// ...this works because if a user enters this into a form field
/// "while(1)"
// if executed like javascript it causes an infinite loop, but if escaped
// "while\(1\)" 
/// it is not valid javascript any longer 
//
// validator is a library that has a lot of sanitization functions in it for input
//
// NoSQL Map is a tool tht can test for SQL injection vulnerablitities

// other ways to prevent XSS
// whitelist allowed input
// blacklist disallowed input (not as thorough or restrictive sa whitelisting)
// standardize format for various kinds of data - e.g. urls always in the form https://www.mydomain.com (as oppsoed to http://mydomain.com)

// to check npm packages for security issues, use nsp. (a cli tool from node)
// there is also snyk ...more detailed upgrade info, but might cost

// disallow older browsers which could have security vulnerabilities
// and/or do all these things
// https://moduscreate.com/blog/simple-security-lambda-edge/

// make sure to assign a new session id on each login. This is to avoid trick where hacker uses someone else's session id to pretend to be that user

class Sheet extends Component {
   maybeRenderLoginOrFetchSheet = () => {
      const { userId, sessionId } = getUserInfoFromCookie();
      if (this.props.stateShowLoginModal || stateIsLoggedIn(managedStore.state) === false || !userId || !sessionId) {
         return <LoginModal />;
      }
      if (!stateSheetId(managedStore.state)) {
         return R.ifElse(
            R.pipe(
               stateSheetErrorMessage,
               isNothing
            ),
            () => triggeredFetchSheet(), // fetch the sheet if there is no sheetId and no sheet error message
            state => <div>{stateSheetErrorMessage(state)}</div> // show the sheet error message if there's no sheetId
         )(managedStore.state);
      }
      return null;
   };

   columnHeaderStyle = colSpan => {
      return {
         gridColumn: colSpan,
         gridRow: 'span 1',
         width: '100%',
         height: '100%',
         padding: 0,
      };
   };

   // TODO this will need to be manipulated to create different sized columns and rows
   // to see the reason for using minmax see https://css-tricks.com/preventing-a-grid-blowout/
   getGridSizingStyle([numRows, numCols]) {
      const rowsStyle = ROW_HEIGHT + ' repeat(' + numRows + ', minmax(0, 1fr)) ' + ROW_HEIGHT;
      const columnsStyle = THIN_COLUMN + ' repeat(' + numCols + ', minmax(0, 1fr)) ' + THIN_COLUMN;
      return {
         gridTemplateRows: rowsStyle,
         gridTemplateColumns: columnsStyle,
      };
   }

   renderGridSizingStyle = () => {
      if (!isVisibilityCalcutated()) {
         return null;
      }
      return this.getGridSizingStyle(
         R.map(getRequiredNumItemsForAxis(R.__, managedStore.state), [ROW_AXIS, COLUMN_AXIS])
      );
   };

   maybeRenderFilterModal = showFilterModal => (showFilterModal ? <FilterModal /> : null);

   render() {
      if (this.props.sheetIsCallingDb) {
         return (
            <div className="m-auto max-w-md">
               <LoadingIcon />
            </div>
         );
      }
      return (
         <div className="px-1">
            <Header />
            <Editor cellContent="" />
            {this.maybeRenderFilterModal(this.props.showFilterModal)}
            {this.maybeRenderLoginOrFetchSheet()}
            <DndProvider backend={HTML5Backend}>
               <div className="grid-container pt-1" style={this.renderGridSizingStyle()}>
                  <Cells /> 
               </div>
            </DndProvider>
         </div>
      );
   }
}

function mapStateToProps(state) {
   return {
      showFilterModal: stateShowFilterModal(state),
      showLoginModal: stateShowLoginModal(state),
      sheetId: stateSheetId(state), // need this to trigger updating the sheet when the sheetId object changes
      sheetIsCallingDb: stateSheetIsCallingDb(state),
      metadata: stateMetadata(state), // this is here so that sheet will update whenever metadata is changed
      cellsLoaded: stateSheetCellsLoaded(state) // this is here so that sheet will update when the cells are loaded after fetching a new sheet
   };
}
export default connect(mapStateToProps, {
   triggeredFetchSheet,
})(Sheet);
