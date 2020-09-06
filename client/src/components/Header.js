import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import SheetHeader from './molecules/SheetHeader';
import TitleForm from './molecules/TitleForm';
import Menu from './molecules/Menu';

export class Header extends Component {
   renderTitleOrTitleForm() {
      if (this.props.title.isEditingTitle) {
         return <TitleForm onSubmit={this.editTitle} title={this.props.title.text} />;
      }
      return <SheetHeader />;
   }

   render() {
      axios
         .get('/.netlify/functions/auth')
         .then(res => console.log('login response', res))
         .catch(err => console.log('error getting login info:', err));

      return (
         <div className="flex">
            <div className="pr-2 max-w-4">
               <Menu />
            </div>
            <div className="w-full">{this.renderTitleOrTitleForm()}</div>
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

export default connect(mapStateToProps)(Header);
