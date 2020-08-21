import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import SheetHeader from './molecules/SheetHeader';
import TitleForm from './molecules/TitleForm';
import Menu from './molecules/Menu';
import { helloQuery } from '../queries/helloQuery';

export class Header extends Component {
   renderTitleOrTitleForm() {
      if (this.props.title.isEditingTitle) {
         return <TitleForm onSubmit={this.editTitle} title={this.props.title.text} />;
      }
      return <SheetHeader />;
   }

   async tempLambdaFunctionTest() {
      try {
         const res = await axios.get('.netlify/functions/hello');
         console.log('got response from .netlify/functions/hello:', res);
      } catch (err) {
         console.log('tempLambdaFunctionTest error', err);
      }
      try {
         const response = await helloQuery();
         console.log('response from hellQuery', response);
      } catch (err) {
         console.error('error getting hello query:', err);
      }
   }

   render() {
      this.tempLambdaFunctionTest();
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
