import React from 'react';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { openedTitleEditor } from '../../actions/titleActions';
import { loadSheet, saveCellUpdates, saveMetadataUpdates } from '../../services/sheetServices';
import {
   stateParentSheetId,
   stateIsStale,
   stateIsCallingDb,
   stateErrorMessages,
} from '../../helpers/dataStructureHelpers';
import Heading from '../atoms/Heading';
import IconEdit from '../atoms/IconEdit';
import IconUpArrow from '../atoms/IconUpArrow';
import SaveIcon from '../atoms/IconSave';
import LoadingIcon from '../atoms/IconLoading';

class SheetHeader extends React.Component {
   constructor(props) {
      super(props);
      this.handleSave = this.handleSave.bind(this);
      this.renderSaveIcon = this.renderSaveIcon.bind(this);
      this.renderUpArrow = this.renderUpArrow.bind(this);
   }

   async handleSave() {
      await this.props.saveCellUpdates(this.props.state);
      console.log(
         'TODO: SheetHeader.handleSave currently calling saveCellUpdates then saveMetadataUpdates serially--yeech!!'
      );
      await this.props.saveMetadataUpdates(this.props.state);
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
      if (stateIsStale(this.props.state)) {
         const classes = stateErrorMessages(this.props.state) ? 'pr-2 text-burnt-orange ' : 'pr-2 ';
         return <SaveIcon height="1.5em" width="1.5em" classes={classes} onClickFn={this.handleSave} />;
      }
   }

   render() {
      return (
         <div className="flex items-center justify-between px-2 py-1" key="SheetHeader">
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

export default connect(mapStateToProps, { openedTitleEditor, saveCellUpdates, saveMetadataUpdates })(SheetHeader);