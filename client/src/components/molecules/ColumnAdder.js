import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import IconAdd from '../atoms/IconAdd';

class ColumnAdder extends Component {
	render() {
		const allClasses = this.props.classes + ' border-r';
		return (
			<div className={allClasses} data-testid="columnAdder">
				<div className="flex items-center px-1">
					<IconAdd classes={'flex-1 h-3 w-3'} onClickFn={() => alert('TODO: add column')} />
				</div>
			</div>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		classes: ownProps.classes,
	};
}

export default connect(mapStateToProps)(ColumnAdder);
