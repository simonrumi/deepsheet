import * as R from 'ramda';
import { capitalCase, pluralize } from './index';

export const getFrozenAxisName = axis => R.pipe(
   capitalCase,
   pluralize,
   R.concat('frozen', R.__)
)(axis);