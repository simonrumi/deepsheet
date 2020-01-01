import React, { Component } from 'react';
import { connect } from 'react-redux';
import { indexToColumnLetter } from '../../helpers';
import { toggledShowFilterModal } from '../../actions';
import IconFilter from '../atoms/IconFilter';

class ColumnHeader extends Component {
	constructor(props) {
		super(props);
		this.showFilterModalForColumn = this.showFilterModalForColumn.bind(this);
	}

	render() {
		const columnLetter = indexToColumnLetter(this.props.index);
		const rightBorder = this.props.index === this.props.totalColumns - 1 ? ' border-r' : '';
		const allClasses = this.props.classes + rightBorder;
		return (
			<div className={allClasses} data-testid={'col' + this.props.index}>
				<div className="flex items-center justify-between px-1">
					<div className="flex-2">{columnLetter}</div>
					<IconFilter classes={'flex-1 h-3 w-3'} onClickFn={this.showFilterModalForColumn} />
				</div>
			</div>
		);
	}

	showFilterModalForColumn = () => this.props.toggledShowFilterModal(null, this.props.index);
}

function mapStateToProps(state, ownProps) {
	return {
		showFilterModal: state.showFilterModal,
		totalColumns: state.sheet.totalColumns,
		index: ownProps.index,
		classes: ownProps.classes,
	};
}

export default connect(
	mapStateToProps,
	{ toggledShowFilterModal }
)(ColumnHeader);
