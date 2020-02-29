import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';

class ModalBackground extends Component {
	constructor(props) {
		super(props);
		this.BASE_CLASSES = 'w-screen h-screen z-10 fixed top-0 left-0 bg-light-light-orange-transparent';
		this.createClasses = this.createClasses.bind(this);
	}

	// see notes in filterSheet.js addNewFilter() on how this pattern works
	createClasses = () =>
		R.useWith(R.ifElse, [R.thunkify(R.not), R.thunkify(R.concat(R.__, ' hidden')), R.thunkify(R.identity)])(
			this.props.modalVisible,
			this.BASE_CLASSES,
			this.BASE_CLASSES
		)();

	render() {
		return <div className={this.createClasses(this.props.modalVisible)} />;
	}
}

function mapStateToProps(state, ownProps) {
	return {
		modalVisible: state.filterModal.showFilterModal,
	};
}

export default connect(mapStateToProps)(ModalBackground);