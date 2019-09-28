// create-react-app's testing script looks in src for this file
// which does some setup for enzyme, needed by all tests
// see https://github.com/airbnb/enzyme/issues/1265
// and https://levelup.gitconnected.com/the-basics-of-testing-a-react-component-2ff635c99044

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });
