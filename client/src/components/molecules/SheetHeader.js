import React from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { connect } from 'react-redux';
import { openedTitleEditor } from '../../actions/titleActions';
import { hidePopups } from '../../actions';
import { undid, redid } from '../../actions/undoActions';
import { loadSheet, saveAllUpdates } from '../../services/sheetServices';
import { arrayContainsSomething, getObjectFromArrayByKeyValue, isSomething } from '../../helpers';
import {
   stateParentSheetId,
   stateIsStale,
   stateIsCallingDb,
   stateErrorMessages,
   stateTitleText,
   statePast,
   stateFuture,
   stateSheets,
} from '../../helpers/dataStructureHelpers';
import Heading from '../atoms/Heading';
import IconEdit from '../atoms/IconEdit';
import IconUpArrow from '../atoms/IconUpArrow';
import SaveIcon from '../atoms/IconSave';
import LoadingIcon from '../atoms/IconLoading';
import UndoIcon from '../atoms/IconUndo';
import RedoIcon from '../atoms/IconRedo';

class SheetHeader extends React.Component {
   constructor(props) {
      super(props);
      this.handleSave = this.handleSave.bind(this);
      this.renderSaveIcon = this.renderSaveIcon.bind(this);
      this.renderUpArrow = this.renderUpArrow.bind(this);
   }

   async handleSave() {
      await this.props.saveAllUpdates(managedStore.state);
   }

   hasLegitParentSheetId() {
      return R.pipe(
         getObjectFromArrayByKeyValue,
         isSomething,
      )('id', stateParentSheetId(managedStore.state), stateSheets(managedStore.state))
   }

   renderUpArrow() {
      if (this.hasLegitParentSheetId()) {
         return (
            <IconUpArrow
               height="1.5em"
               width="1.5em"
               classes="pl-2"
               onClickFn={() => R.pipe(stateParentSheetId, loadSheet(managedStore.state))(managedStore.state)}
               data-testid="titleUpArrow"
            />
         );
      }
      return null;
   }

   renderSaveIcon() {
      if (this.props.isCallingDb) {
         return <LoadingIcon height="2em" width="2em" classes="pr-2" />;
      }
      if (this.props.isStale) {
         const classes = stateErrorMessages(managedStore.state) ? 'pr-2 text-burnt-orange ' : 'pr-2 ';
         return <SaveIcon height="1.5em" width="1.5em" classes={classes} onClickFn={this.handleSave} />;
      }
   }

   renderUndoRedoIcons() {
      const undoClasses = arrayContainsSomething(this.props.past) ? 'text-subdued-blue hover:text-vibrant-blue pr-2' : 'text-grey-blue pr-2';
      const redoClasses = arrayContainsSomething(this.props.future) ? 'text-subdued-blue hover:text-vibrant-blue' : 'text-grey-blue';
      return (
         <div className="flex items-center justify-between pr-2">
            <UndoIcon height="1.5em" width="1.5em" classes={undoClasses} onClickFn={undid} />
            <RedoIcon height="1.5em" width="1.5em" classes={redoClasses} onClickFn={redid} />
         </div>
      );
   }

   render() {
      return (
         <div className="flex items-center justify-between px-2 py-1" onClick={this.props.hidePopups} key="SheetHeader">
            <Heading text={this.props.title} classes="pr-2" />
            <div className="flex items-end justify-between">
               {this.renderSaveIcon()}
               {this.renderUndoRedoIcons()}
               <IconEdit height="1.5em" width="1.5em" onClickFn={() => this.props.openedTitleEditor(true)} />
               {this.renderUpArrow()}
            </div>
         </div>
      );
   }
}

function mapStateToProps(state) {
   return {
      title: stateTitleText(state),
      past: statePast(state),
      future: stateFuture(state),
      isStale: stateIsStale(state),
      isCallingDb: stateIsCallingDb(state),
   };
}

export default connect(mapStateToProps, {
   openedTitleEditor,
   saveAllUpdates,
   hidePopups,
})(SheetHeader);
