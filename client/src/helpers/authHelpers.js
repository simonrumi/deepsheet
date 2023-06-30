import * as R from 'ramda';
import { isSomething, arrayContainsSomething, ifThenElse } from '../helpers';
import { LOCAL_STORAGE_STATE_KEY, LOCAL_STORAGE_ACTION_KEY, LOCAL_STORAGE_TIME_KEY } from '../constants';

export const saveToLocalStorage = (state, action) => {
   window.localStorage.clear();
   window.localStorage.setItem(LOCAL_STORAGE_STATE_KEY, JSON.stringify(state));
   if (isSomething(action)) {
		window.localStorage.setItem(LOCAL_STORAGE_ACTION_KEY, JSON.stringify(action));
	}
   window.localStorage.setItem(LOCAL_STORAGE_TIME_KEY, Date.now());
}

export const has401Error = errArr => {
	return ifThenElse({
		ifCond: arrayContainsSomething,
		thenDo: R.reduce(
			(accumulator, err) => /status code 401/.test(err) ? R.reduced(true) : accumulator,
			false
		),
		elseDo: () => false,
		params: { ifParams: errArr, thenParams: [ errArr ] }
	});
}

export const convertErrorToString = err => {
	if (isSomething(err)) {
		if (err instanceof Error) {
			return err.message;
		}
		if (typeof err === 'string') {
			return err;
		}
		if (typeof err === 'object') {
			return R.reduce(
				(accumulator, errKey) => {
					switch (errKey) {
						case 'errorMessage':
						case 'error':
						case 'message':
							return R.pipe(R.prop, R.reduced)(errKey, err);
						default:
							return accumulator
					}
				},
				null, // default value
				R.keys(err) // will look through the keys in the err object, trying to find something that is an error string
			);
		}
	}
	return null;
}

export const addErrorMessage = ({ err, errArr }) => isSomething(err)
		? arrayContainsSomething(errArr) 
			? R.append(convertErrorToString(err), errArr) 
			: [ convertErrorToString(err) ]
		: errArr;