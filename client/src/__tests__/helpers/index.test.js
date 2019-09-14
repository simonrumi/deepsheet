import { removePTags } from '../../helpers';

describe('removePTags', () => {
	it('removes P tags from a string', () => {
		const str = '<p>this is a typical string surrounded in p tags</p>';
		expect(removePTags(str)).toEqual('this is a typical string surrounded in p tags');
	});
});
