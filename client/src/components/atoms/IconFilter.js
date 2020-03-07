import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { toggledShowFilterModal } from '../../actions';

class IconFilter extends Component {
	renderOutline = () => {
		return (
			<svg
				style={this.props.style}
				height={this.props.height}
				width={this.props.width}
				viewBox="0 0 511 511"
				className="fill-current"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="m492.476562 0h-471.976562c-11.046875 0-20 8.953125-20 20 0 55.695312 23.875 108.867188 65.503906 145.871094l87.589844 77.851562c15.1875 13.5 23.898438 32.898438 23.898438 53.222656v195.03125c0 15.9375 17.8125 25.492188 31.089843 16.636719l117.996094-78.660156c5.5625-3.710937 8.90625-9.953125 8.90625-16.640625v-116.367188c0-20.324218 8.710937-39.722656 23.898437-53.222656l87.585938-77.851562c41.628906-37.003906 65.503906-90.175782 65.503906-145.871094 0-11.046875-8.953125-20-19.996094-20zm-72.082031 135.972656-87.585937 77.855469c-23.71875 21.085937-37.324219 51.378906-37.324219 83.113281v105.667969l-77.996094 51.996094v-157.660157c0-31.738281-13.605469-62.03125-37.324219-83.117187l-87.585937-77.851563c-28.070313-24.957031-45.988281-59.152343-50.785156-95.980468h429.386719c-4.796876 36.828125-22.710938 71.023437-50.785157 95.976562zm0 0" />
			</svg>
		);
	};

	renderSolid = () => {
		return (
			<svg
				style={this.props.style}
				height={this.props.height}
				width={this.props.width}
				viewBox="0 0 394 394"
				className="fill-current"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="m367.820312 0h-351.261718c-6.199219-.0117188-11.878906 3.449219-14.710938 8.960938-2.871094 5.585937-2.367187 12.3125 1.300782 17.414062l128.6875 181.285156c.042968.0625.089843.121094.132812.183594 4.675781 6.3125 7.207031 13.960938 7.21875 21.816406v147.800782c-.027344 4.375 1.691406 8.582031 4.773438 11.6875 3.085937 3.101562 7.28125 4.851562 11.65625 4.851562 2.222656-.003906 4.425781-.445312 6.480468-1.300781l72.3125-27.570313c6.476563-1.980468 10.777344-8.09375 10.777344-15.453125v-120.015625c.011719-7.855468 2.542969-15.503906 7.214844-21.816406.042968-.0625.089844-.121094.132812-.183594l128.691406-181.289062c3.667969-5.097656 4.171876-11.820313 1.300782-17.40625-2.828125-5.515625-8.511719-8.9765628-14.707032-8.964844zm0 0" />
			</svg>
		);
	};

	renderIcon = () => (this.props.fitlerEngaged ? this.renderSolid() : this.renderOutline());

	render() {
		const allClasses = 'text-grey-blue hover:text-vibrant-blue cursor-pointer ' + this.props.classes;
		return (
			<div className={allClasses} onClick={this.props.onClickFn} data-testid={this.props.testId}>
				{this.renderIcon()}
			</div>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		style: ownProps.style || {},
		width: ownProps.width || '100%',
		height: ownProps.height || '100%',
		classes: ownProps.classes || '',
		testId: ownProps.testId || '',
		onClickFn: ownProps.onClickFn,
		fitlerEngaged: ownProps.fitlerEngaged || false,
	};
}

export default connect(mapStateToProps)(IconFilter);
