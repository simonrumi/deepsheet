import * as R from 'ramda';
import { isSomething, arrayContainsSomething, ifThenElse } from '../helpers';
import { LOCAL_STORAGE_STATE_KEY, LOCAL_STORAGE_ACTION_KEY, LOCAL_STORAGE_TIME_KEY } from '../constants';

export const saveToLocalStorage = (state, action) => {
   window.localStorage.clear();
   window.localStorage.setItem(LOCAL_STORAGE_STATE_KEY, JSON.stringify(state));
   window.localStorage.setItem(LOCAL_STORAGE_ACTION_KEY, JSON.stringify(action));
   window.localStorage.setItem(LOCAL_STORAGE_TIME_KEY, Date.now());
}

export const has401Error = errArr => {
	console.log('authHelpers--has401Error got errArr', errArr);
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
	console.log('authHelpers--convertErrorToString got err', err, 
		'err instanceof Error', (err instanceof Error),
		'typeof err === string', typeof err === 'string'
	);

	if (isSomething(err)) {
		if (err instanceof Error) {
			console.log('authHelpers--convertErrorToString err is an instanceof Error with err.message', err.message);
			return err.message;
		}
		if (typeof err === 'string') {
			console.log('authHelpers--convertErrorToString err is a string');
			return err;
		}
		if (typeof err === 'object') {
			console.log('authHelpers--convertErrorToString err is an object');
			return R.reduce(
				(accumulator, errKey) => {
					switch (errKey) {
						case 'errorMessage':
						case 'error':
						case 'message':
							console.log('authHelpers--convertErrorToString will return the value of the key', errKey);
							return R.pipe(R.prop, R.reduced)(errKey, err);
						default:
							console.log('authHelpers--convertErrorToString found no error key so will return null');
							return accumulator
					}
				},
				null, // default value
				R.keys(err) // will look through the keys in the err object, trying to find something that is an error string
			);
		}
	}
	console.log('authHelpers--convertErrorToString err neither a string nor an Error');
	return null;
}

export const addErrorMessage = ({ err, errArr }) => isSomething(err)
		? arrayContainsSomething(errArr) 
			? R.append(convertErrorToString(err), errArr) 
			: [ convertErrorToString(err) ]
		: errArr;