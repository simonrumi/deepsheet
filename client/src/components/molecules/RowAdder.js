import React, { Component } from 'react';
import { connect } from 'react-redux';
import insertNewRow from '../../services/insertNewRow';
import IconAdd from '../atoms/IconAdd';

class RowAdder extends Component {
	render() {
		return (
			<div className={this.props.classes} data-testid="rowAdder">
				<div className="flex items-center px-2 py-2">
					<IconAdd
						classes={'flex-1 h-3 w-3'}
						onClickFn={() =>
							insertNewRow(
								this.props.cellKeys,
								this.props.totalRows,
								this.props.totalColumns,
								this.props.sheet
							)
						}
					/>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		sheet: state.sheet,
		totalRows: state.sheet.totalRows,
		totalColumns: state.sheet.totalColumns,
		cellKeys: state.cellKeys,
		classes: ownProps.classes,
	};
}

export default connect(mapStateToProps)(RowAdder);
