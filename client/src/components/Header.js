import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setEditingTitle } from '../actions';
import TitleForm from './TitleForm';

export class Header extends Component {
	constructor(props) {
		super(props);
		this.renderTitleOrTitleForm = this.renderTitleOrTitleForm.bind(this);
		this.renderTitle = this.renderTitle.bind(this);
	}

	render() {
		return <div>{this.renderTitleOrTitleForm()}</div>;
	}

	renderTitleOrTitleForm() {
		if (this.props.title.isEditingTitle) {
			return <TitleForm onSubmit={this.editTitle} title={this.props.sheet.metadata.title} />;
		}
		return this.renderTitle();
	}

	renderTitle() {
		let title = '';
		if (this.props.sheet && this.props.sheet.metadata && this.props.sheet.metadata.title) {
			title = this.props.sheet.metadata.title;
		}
		return (
			<div className="ui grid">
				<div className="eight wide column">
					<h2 className="vibrant-blue text">{title}</h2>
				</div>
				<div className="right aligned eight wide column">
					<i className="edit icon" onClick={() => this.props.setEditingTitle(true)} />
				</div>
			</div>
		);
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
)(Header);
