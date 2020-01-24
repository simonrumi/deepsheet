import React from 'react';
import { connect } from 'react-redux';
import { setEditingTitle } from '../../actions';
import { loadSheet } from '../../helpers';
import Heading from '../atoms/Heading';
import IconEdit from '../atoms/IconEdit';
import IconUpArrow from '../atoms/IconUpArrow';

class HeaderTitle extends React.Component {
	render() {
		return (
			<div className="flex items-center justify-between px-2 py-1">
				<Heading text={this.props.title.text} />
				<div className="flex items-end justify-between">
					<IconEdit height="1.5em" width="1.5em" onClickFn={() => this.props.setEditingTitle(true)} />
					{this.renderUpArrow()}
				</div>
			</div>
		);
	}

	renderUpArrow() {
		if (this.props.sheet.parentSheetId) {
			return (
				<IconUpArrow
					height="1.5em"
					width="1.5em"
					classes="pl-2"
					onClickFn={() => loadSheet(this.props.sheet.parentSheetId)}
					data-testid="titleUpArrow"
				/>
			);
		}
		return null;
	}
}

function mapStateToProps(state) {
	return {
		sheet: state.sheet,
		title: state.title,
	};
}

export default connect(
	mapStateToProps,
	{ setEditingTitle }
)(HeaderTitle);