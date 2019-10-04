import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Header from './Header';
import Editor from './Editor';
import Row from './Row';
import { fetchSheet } from '../actions';
import { generateCellReducers } from '../reducers/reducerManager';
import { populateCellsInStore } from '../helpers';

class App extends Component {
   async componentDidMount() {
      //call the reducer to populate the store with the sheet data
      const sheet = await this.props.fetchSheet();
      // TODO: the end goal is not to put the whole sheet in the store,
      // but to have the collection of individual cell reducers instead
      debugger;
      generateCellReducers(this.props.sheet.metadata);
      populateCellsInStore(sheet);
   }

   renderRows() {
      // TODO use ramda instead of lodash
      // TODO don't send the actual row content, instead just send the row number
      // and have the Row component get the content from the sheet in the Store
      return _.map(this.props.sheet.content, row => {
         return <Row cells={row.content} key={row.metadata.row} />;
      });
   }

   renderGridSizingSyle() {
      if (this.props.sheet.metadata) {
         const columnsStyle =
            'repeat(' +
            this.props.sheet.metadata.totalColumns +
            ', [col-start] 1fr)';
         const rowsStyle =
            'repeat(' +
            this.props.sheet.metadata.totalRows +
            ', [row-start] 1fr)';
         return {
            gridTemplateColumns: columnsStyle,
            gridTemplateRows: rowsStyle,
         };
      }
   }

   render() {
      return (
         <div className="ui container">
            <Header />
            <div className="editor-container">
               <Editor />
            </div>
            <div className="grid-container" style={this.renderGridSizingSyle()}>
               {this.renderRows()}
            </div>
            <div className="clear" />
         </div>
      );
   }
}

function mapStateToProps(state) {
   return { rows: state.rows, sheet: state.sheet };
}

export default connect(
   mapStateToProps,
   { fetchSheet, generateCellReducers }
)(App);
