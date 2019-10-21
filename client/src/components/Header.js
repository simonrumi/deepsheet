import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setEditingTitle } from '../actions';
import { loadSheet } from '../helpers';
import TitleForm from './TitleForm';

export class Header extends Component {
   render() {
      return <div>{this.renderTitleOrTitleForm()}</div>;
   }

   renderTitleOrTitleForm() {
      if (this.props.title.isEditingTitle) {
         return (
            <TitleForm
               onSubmit={this.editTitle}
               title={this.props.title.text}
            />
         );
      }
      return this.renderTitle();
   }

   renderTitle() {
      return (
         <div className="ui grid">
            <div className="twelve wide column">
               <h2 className="subdued-blue">{this.props.title.text}</h2>
            </div>
            <div className="right aligned four wide column">
               <span className="right floated two wide column">
                  <i
                     className="subdued-blue edit icon pointer"
                     onClick={() => this.props.setEditingTitle(true)}
                  />
               </span>
               <span>{this.renderUpArrow()}</span>
            </div>
         </div>
      );
   }

   renderUpArrow() {
      if (this.props.sheet.parentSheetId) {
         return (
            <i
               className="subdued-blue external alternate icon pointer"
               onClick={() => loadSheet(this.props.sheet.parentSheetId)}
            />
         );
      }
      return null;
   }
}

function mapStateToProps(state) {
   return {
      sheet: state.sheet,
      title: state.title,
   };
}

export default connect(
   mapStateToProps,
   { setEditingTitle }
)(Header);
