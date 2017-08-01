import nestedShape from '../nestedShape';
import Types from '../Types';
import { expect } from 'chai';

import { valid, invalid, expectValidator } from './utils/validators';

describe('nestedShapeType', () => {
  it('works', () => {
    const shape = nestedShape({ foo: Types.number });
    valid(shape, { foo: 1 });
    invalid(shape, { foo: '' });
    invalid(shape.isRequired, null);
  });

  it('more', () => {
    const shape = nestedShape({
      foo: Types.number,
      bar: {
        baz: Types.number,
        bax: Types.number,
      }
    });
    valid(shape, { foo: 1, bar: {} });
    valid(shape, { foo: 1, bar: { baz: 1 } });
    invalid(shape, { foo: 1, bar: { baz: '' } });
    invalid(shape, { bar: 1 });
  });

  it('more', () => {
    const shape = nestedShape({
      foo: Types.number,
      bar: Types.shape({
        baz: Types.number,
        bax: Types.number,
      }).isRequired,
    });
    valid(shape, { foo: 1, bar: {} });
    invalid(shape, { foo: 1 });
    invalid(shape, { bar: 1 });
  });
});
