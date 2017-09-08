import { expect } from 'chai';

import checkPropTypes from './checkPropTypes';

export function valid(propTypes, value) {
  expect(checkPropTypes({ value: propTypes }, { value }, 'value', 'Foo')).to.not.exist;
}

export function invalid(propTypes, value) {
  if (process.env.NODE_ENV === 'production') {
    return valid(propTypes, value);
  }
  expect(checkPropTypes({ value: propTypes }, { value }, 'value', 'Foo')).to.be.instanceOf(Error);
}

export function expectValidator(v) {
  expect(typeof v).to.equal('function');
  expect(typeof v.isRequired).to.equal('function');
}
