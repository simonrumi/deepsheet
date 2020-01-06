import React, { Component } from 'react';
import { Field } from 'redux-form';
import { connect } from 'react-redux';
import Label from '../atoms/Label';
import TextInput from './TextInput';
import Checkbox from './Checkbox';
import Button from '../atoms/Button';

class FilterOptions extends Component {
	render() {
		const allClasses =
			'border-t-0 border-r border-b border-l border-solid border-grey-blue flex items-start justify-between px-2 py-2 ' +
			this.props.classes;

		return (
			<div className={allClasses}>
				<Label label="Filter" />
				<div>
					<Field name="filterExpression" component={this.renderFilterInput} />
					<div className="flex items-center px-2 py-2">
						<Field
							name="caseSensitiveCheckbox"
							component={this.renderCaseSensitiveCheckbox}
							classes="pl-0"
						/>
						<Label label="Case sensitive" classes="pl-2" />
					</div>
					<div className="flex items-center px-2 py-2">
						<Field name="regexCheckbox" component={this.renderRegexCheckbox} />
						<Label label="Regular expression" classes="pl-2" />
					</div>
					<Button
						buttonType="button"
						classes=""
						onClickFn={() => alert('TODO: clear filtering')}
						label="Clear Filtering"
					/>
				</div>
			</div>
		);
	}

	renderFilterInput = formProps => {
		return <TextInput formProps={formProps} testId="filterInput" placeholder="placeholder value here" />;
	};

	renderCaseSensitiveCheckbox = formProps => {
		return <Checkbox formProps={formProps} testId="caseSensitiveCheckbox" />;
	};

	renderRegexCheckbox = formProps => {
		return <Checkbox formProps={formProps} testId="regexCheckbox" />;
	};
}

const mapStateToProps = (state, ownProps) => {
	return {
		sheet: state.sheet, // probably don't need this
		classes: ownProps.classes || '',
	};
};

export default connect(mapStateToProps)(FilterOptions);
