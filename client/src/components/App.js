import React from 'react';
import { connect } from 'react-redux';

import Sheet from './Sheet';
import { DEFAULT_SHEET_ID } from '../actions/types';

const App = props => {
	return <Sheet sheetId={props.sheetId || DEFAULT_SHEET_ID} />;
};

function mapStateToProps(state) {
	return {
		sheetId: state.sheetId,
	};
}

export default connect(mapStateToProps)(App);
