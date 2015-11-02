import nestedShape from '../nestedShape';
import Types from '../Types';
import { expect } from 'chai';

function expectValidator(v) {
  expect(typeof v).to.equal('function');
  expect(typeof v.isRequired).to.equal('function');
}

function valid(validator, value) {
  expect(validator({ value }, 'value', 'Foo')).to.be.null;
}

function invalid(validator, value) {
  expect(validator({ value }, 'value', 'Foo')).to.be.instanceOf(Error);
}


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
