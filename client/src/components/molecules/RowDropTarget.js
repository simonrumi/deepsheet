import * as R from 'ramda';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DropTarget } from 'react-dnd';
import { ItemTypes } from '../../constants';
import { moveRow } from '../../services/moveRow';

const targetSpec = {
	drop: (props, monitor, component) => {
		console.log('targetSpec.drop: props=', props, 'monitor', monitor, 'component', component);
		// TODO here is where we need to  trigger an action to moveRow
	},

	// hover: (props, monitor, component) =>
	//    console.log('targetSpec.hover: props=', props),
	// canDrop: (props, monitor) =>
	//    console.log('targetSpec.canDrop: props=', props),
};

const targetCollect = (connect, monitor, props) => {
	return {
		// Call this function inside render() to let React DnD handle the drag events:
		connectDropTarget: connect.dropTarget(),

		// You can ask the monitor about the current drag state:
		isOver: monitor.isOver(),
		canDrop: monitor.canDrop(),
		itemType: monitor.getItemType(),
	};
};

const renderClasses = (classes, isOver, canDrop) =>
	R.cond([
		[R.thunkify(R.and)(isOver, canDrop), () => classes + ' h-1 bg-vibrant-blue visible'],
		[R.thunkify(R.and)(!isOver, canDrop), () => classes + ' h-1 bg-light-light-blue visible'],
		[R.thunkify(R.and)(!isOver, !canDrop), () => classes + ' h-1 invisible'],
	])();

class RowDropTarget extends Component {
	render() {
		const id = 'rowTarget_' + this.props.rowIndex;

		// These props are injected by React DnD, as defined by targetCollect function above:
		const { isOver, canDrop, connectDropTarget } = this.props;

		const allClasses = renderClasses(this.props.classes, isOver, canDrop);
		return connectDropTarget(<div id={id} className={allClasses} />);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		rowIndex: ownProps.rowIndex,
		classes: ownProps.classes,
	};
}

const RowDropTargetWrapped = DropTarget(ItemTypes.DRAGGABLE_ROW_HEADER, targetSpec, targetCollect)(RowDropTarget);
export default connect(
	mapStateToProps,
	{}
)(RowDropTargetWrapped);
