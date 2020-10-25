import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { stateShowFilterModal, stateShowLoginModal } from '../../helpers/dataStructureHelpers';

class ModalBackground extends Component {
   constructor(props) {
      super(props);
      this.BASE_CLASSES = 'w-screen h-screen z-10 fixed top-0 left-0 bg-light-light-orange-transparent';
      this.createClasses = this.createClasses.bind(this);
   }

   // see notes in filterSheet.js addNewFilter() on how this pattern works
   createClasses = modalVisible =>
      R.useWith(R.ifElse, [R.thunkify(R.not), R.thunkify(R.concat(R.__, ' hidden')), R.thunkify(R.identity)])(
         modalVisible,
         this.BASE_CLASSES,
         this.BASE_CLASSES
      )();

   render() {
      return <div className={this.createClasses(this.props.modalVisible)} />;
   }
}

function mapStateToProps(state, ownProps) {
   return {
      modalVisible: stateShowFilterModal(state) || stateShowLoginModal(state),
   };
}

export default connect(mapStateToProps)(ModalBackground);
