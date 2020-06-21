import React from 'react';
import { connect } from 'react-redux';
import { openedTitleEditor } from '../../actions/titleActions';
import { loadSheet } from '../../services/sheetServices';
import Heading from '../atoms/Heading';
import IconEdit from '../atoms/IconEdit';
import IconUpArrow from '../atoms/IconUpArrow';
import SaveIcon from '../atoms/IconSave';

class HeaderTitle extends React.Component {
   renderUpArrow() {
      if (this.props.sheet.parentSheetId) {
         return (
            <IconUpArrow
               height="1.5em"
               width="1.5em"
               classes="pl-2"
               onClickFn={() => loadSheet(this.props.sheet.parentSheetId)}
               data-testid="titleUpArrow"
            />
         );
      }
      return null;
   }

   renderSaveIcon() {
      if (this.props.sheet.hasChanged) {
         return <SaveIcon height="1.5em" width="1.5em" classes="pr-2" />;
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
      sheet: state.sheet,
      title: state.title,
   };
}

export default connect(mapStateToProps, { openedTitleEditor })(HeaderTitle);
