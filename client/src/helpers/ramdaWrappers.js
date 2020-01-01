/**
 * this is intended for use in debugging only.
 * instead of calling e.g. R.ifElse(...) call RWrap.ifElse(..., message, true/false) (last 2 params are optional)
 **/

import * as R from 'ramda';

const LOGGING_ON = true;

export const log = function() {
	if (LOGGING_ON) {
		R.map(console.log, arguments);
	}
};

export const curry = (fn, msg, showMessages = true) => {
	if (LOGGING_ON && showMessages) {
		msg = msg || 'curry wrapper';
		log(msg, ' - fn:', fn, ' - curry(fn) ->', R.curry(fn));
	}
	return R.curry(fn);
};

export const hasPath = (path, obj, msg, showMessages = true) => {
	if (LOGGING_ON && showMessages) {
		msg = msg || 'hasPath wrapper';
		log(msg, ' - path:', path, ' - obj:', JSON.stringify(obj), ' - hasPath(path, obj) ->', R.hasPath(path, obj));
	}
	return R.hasPath(path, obj);
};

export const ifElse = (condtion, onTrue, onFalse, msg, showMessages = true) => {
	if (LOGGING_ON && showMessages) {
		msg = msg || 'ifElse wrapper';
		log(
			msg,
			' - condtion:',
			condtion,
			' - onTrue:',
			onTrue,
			' - onFalse:',
			onFalse,
			' - ifElse(condtion, onTrue, onFalse) -> ',
			R.ifElse(condtion, onTrue, onFalse)
		);
	}
	return R.ifElse(condtion, onTrue, onFalse);
};

export const isEmpty = (arg1, msg, showMessages = true) => {
	if (LOGGING_ON && showMessages) {
		msg = msg || 'isEmpty wrapper';
		log(msg, ' - arg1:', JSON.stringify(arg1), ' - isEmpty(' + arg1 + ') -> ', R.isEmpty(arg1));
	}
	return R.isEmpty(arg1);
};

export const map = (fn, list, msg, showMessages = true) => {
	if (LOGGING_ON && showMessages) {
		msg = msg || 'map wrapper';
		log(msg, ' - fn:', fn, ' - list:', list, ' - map(fn, list) -> ', JSON.stringify(R.map(fn, list)));
	}
	return R.map(fn, list);
};

export const or = (arg1, arg2, msg, showMessages = true) => {
	if (LOGGING_ON && showMessages) {
		msg = msg || 'or wrapper';
		log(msg, ' - arg1:', arg1, ' - arg2:', arg2, ' - R.or(arg1, arg2) -> ', R.or(arg1, arg2));
	}
	return R.or(arg1, arg2);
};
