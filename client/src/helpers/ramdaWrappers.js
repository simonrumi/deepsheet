import * as R from 'ramda';

const LOGGING_ON = true;

export const log = msg => {
	if (LOGGING_ON) {
		console.log(msg);
	}
};

export const curry = (fn, msg, showMessages = true) => {
	if (LOGGING_ON && showMessages) {
		msg = msg || 'curry warpper';
		log(msg);
		log('   fn:');
		log(fn);
		log('   curry(fn) ->');
		log(R.curry(fn));
	}
	return R.curry(fn);
};

export const ifElse = (condtion, onTrue, onFalse, msg, showMessages = true) => {
	if (LOGGING_ON && showMessages) {
		msg = msg || 'ifElse warpper';
		log(msg);
		log('   condtion:');
		log(condtion);
		log('   onTrue:');
		log(onTrue);
		log('   onFalse:');
		log(onFalse);
		log('   ifElse(condtion, onTrue, onFalse) -> ' + R.ifElse(condtion, onTrue, onFalse));
	}
	return R.ifElse(condtion, onTrue, onFalse);
};

export const isEmpty = (arg1, msg, showMessages = true) => {
	if (LOGGING_ON && showMessages) {
		msg = msg || 'isEmpty warpper';
		log(msg);
		log('   arg1:' + JSON.stringify(arg1));
		log('   isEmpty(' + arg1 + ') -> ' + R.isEmpty(arg1));
	}
	return R.isEmpty(arg1);
};

export const map = (fn, list, msg, showMessages = true) => {
	if (LOGGING_ON && showMessages) {
		msg = msg || 'map warpper';
		log(msg);
		log('   fn:\n   ' + JSON.stringify(fn));
		log('   list:\n   ' + JSON.stringify(list));
		log('   map(fn, list) -> ' + JSON.stringify(R.map(fn, list)));
	}
	return R.map(fn, list);
};

export const or = (arg1, arg2, msg, showMessages = true) => {
	if (LOGGING_ON && showMessages) {
		msg = msg || 'or warpper';
		log(msg);
		log('   arg1:' + JSON.stringify(arg1));
		log('   arg2:' + JSON.stringify(arg2));
		log('   R.or(arg1, arg2) -> ', R.or(arg1, arg2));
	}
	return R.or(arg1, arg2);
};
