import React, { Component } from 'react';
import { connect } from 'react-redux';
import SheetHeader from './molecules/SheetHeader';
import TitleForm from './molecules/TitleForm';

export class Header extends Component {
   render() {
      return <div>{this.renderTitleOrTitleForm()}</div>;
   }

   renderTitleOrTitleForm() {
      if (this.props.title.isEditingTitle) {
         return <TitleForm onSubmit={this.editTitle} title={this.props.title.text} />;
      }
      return <SheetHeader />;
   }
}

function mapStateToProps(state) {
   return {
      sheet: state.sheet,
      title: state.title,
   };
}

export default connect(mapStateToProps)(Header);
