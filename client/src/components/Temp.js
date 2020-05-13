import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import sheetQuery from '../queries/sheetQuery';

class Temp extends Component {
   render() {
      console.log(
         'this.props.sheetId',
         this.props.sheetId,
         'this.props.data',
         this.props.data
      );
      return <div>temp</div>;
   }
}

export default graphql(sheetQuery, {
   options: props => {
      console.log('in fn returning sheetQuery props, props =', props);
      return { variables: { id: props.sheetId } };
   },
})(Temp);
