import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DropTarget } from 'react-dnd';
import { ItemTypes } from '../../constants';
import IconRowInsert from '../atoms/IconRowInsert';

const targetSpec = {
	drop: (props, monitor, component) => console.log('targetSpec.drop: props=', props),
	hover: (props, monitor, component) => console.log('targetSpec.hover: props=', props),
	canDrop: (props, monitor) => console.log('targetSpec.canDrop: props=', props),
};

const targetCollect = (connect, monitor, props) => {
	return {
		// Call this function inside render()
		// to let React DnD handle the drag events:
		connectDropTarget: connect.dropTarget(),

		// TODO probably don't need all these states fromt the monitor
		// You can ask the monitor about the current drag state:
		isOver: monitor.isOver(),
		isOverCurrent: monitor.isOver({ shallow: true }),
		canDrop: monitor.canDrop(),
		itemType: monitor.getItemType(),
	};
};

class RowDropTarget extends Component {
	componentDidUpdate(previousProps) {
		if (!previousProps.isOver && this.props.isOver) {
			// You can use this as enter handler
			console.log('entered RowDropTarget', this.props.rowIndex);
		}

		if (previousProps.isOver && !this.props.isOver) {
			// You can use this as leave handler
			console.log('left RowDropTarget', this.props.rowIndex);
		}
	}
	render() {
		const id = 'rowTarget_' + this.props.rowIndex;

		// These props are injected by React DnD, as defined by targetCollect function above:
		const { isOver, canDrop, connectDropTarget } = this.props;
		const visiblity = isOver ? ' visible' : ' invisible';
		const allClasses = this.props.classes + ' h-1 bg-light-light-blue' + visiblity;
		console.log('rendering RowDropTarget', id, 'isOver =', isOver);
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
