import React from 'react';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { openedTitleEditor } from '../../actions/titleActions';
import { updatedCells } from '../../actions/cellActions';
import { loadSheet } from '../../services/sheetServices';
import { isSomething } from '../../helpers';
import {
   stateParentSheetId,
   stateHasChanged,
   stateChangedCells,
   stateCell,
   stateSheetId,
   stateIsCallingDb,
   stateCellDbUpdatesErrorMessage,
   stateCellDbUpdatesIsStale,
} from '../../helpers/dataStructureHelpers';
import Heading from '../atoms/Heading';
import IconEdit from '../atoms/IconEdit';
import IconUpArrow from '../atoms/IconUpArrow';
import SaveIcon from '../atoms/IconSave';
import LoadingIcon from '../atoms/IconLoading';

class HeaderTitle extends React.Component {
   constructor(props) {
      super(props);
      this.handleSave = this.handleSave.bind(this);
      this.renderSaveIcon = this.renderSaveIcon.bind(this);
      this.renderUpArrow = this.renderUpArrow.bind(this);
   }

   handleSave() {
      const changedCellsCoordinates = stateChangedCells(this.props.state);
      if (isSomething(changedCellsCoordinates)) {
         const changedCells = R.map(({ row, column }) => {
            const cellData = stateCell(row, column, this.props.state);
            return R.omit(['hasChanged'], cellData); // the hasChanged ppty is just for the redux state, not for the db to save
         })(changedCellsCoordinates);

         const sheetId = stateSheetId(this.props.state);

         try {
            this.props.updatedCells({ sheetId, changedCells });
         } catch (err) {
            console.error('HeaderTitle.handleSave - error updating cells in db', err);
            throw new Error('Error updating cells in db', err);
         }
      }
   }

   renderUpArrow() {
      if (stateParentSheetId(this.props.state)) {
         return (
            <IconUpArrow
               height="1.5em"
               width="1.5em"
               classes="pl-2"
               onClickFn={() => R.pipe(stateParentSheetId, loadSheet)(this.props.state)}
               data-testid="titleUpArrow"
            />
         );
      }
      return null;
   }

   renderSaveIcon() {
      if (stateIsCallingDb(this.props.state)) {
         return <LoadingIcon height="2em" width="2em" classes="pr-2" />;
      }
      if (stateHasChanged(this.props.state)) {
         const classes =
            stateCellDbUpdatesErrorMessage(this.props.state) && stateCellDbUpdatesIsStale(this.props.state)
               ? 'pr-2 text-burnt-orange '
               : 'pr-2 ';
         return <SaveIcon height="1.5em" width="1.5em" classes={classes} onClickFn={this.handleSave} />;
      }
   }

   render() {
      return (
         <div className="flex items-center justify-between px-2 py-1" key="headerTitle">
            <Heading text={this.props.title.text} />
            <div className="flex items-end justify-between">
               {this.renderSaveIcon()}
               <IconEdit height="1.5em" width="1.5em" onClickFn={() => this.props.openedTitleEditor(true)} />
               {this.renderUpArrow()}
            </div>
         </div>
      );
   }
}

function mapStateToProps(state) {
   return {
      state,
      title: state.title,
   };
}

export default connect(mapStateToProps, { openedTitleEditor, updatedCells })(HeaderTitle);
