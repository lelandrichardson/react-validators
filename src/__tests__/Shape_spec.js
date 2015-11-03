import { expect } from 'chai';
import { PropTypes } from 'react';
import Shape from '../Shape';
import Types from '../Types';

function valid(validator, value) {
  expect(validator({ value }, 'value', 'Foo')).to.be.null;
}

function invalid(validator, value) {
  expect(validator({ value }, 'value', 'Foo')).to.be.instanceOf(Error);
}

describe('Shape', () => {
  const shape = Shape({
    foo: Types.number,
    bar: Types.number,
    baz: Types.number,
  });
  const nestedShape = Shape({
    foo: {
      boo: Types.number,
      bam: Types.number,
    },
    bar: {
      qoo: Types.number,
      qux: Types.number,
    },
  });

  describe('(Basic)', () => {
    it('accepts underfilled shapes', () => {
      valid(shape, { foo: 1, bar: 2 });
    });

    it('accepts overfilled shapes', () => {
      valid(shape, { foo: 1, bar: 2, baz: 3, bag: 4 });
    });

    it('rejects shapes with wrong type', () => {
      invalid(shape, { foo: 'string' });
    });
  });

  describe('.requires()', () => {

    it('throws when an invalid key is passed in', () => {
      expect(() => shape.requires('invalid')).to.throw;
    });

    describe('(Basic Shape)', () => {
      it('marks top level props as required', () => {
        valid(shape.requires(`foo`), { foo: 1 });
        valid(shape.requires(`foo`), { foo: 1, bar: 2 });
        invalid(shape.requires(`foo`), { bar: 1 });
      });
    });

    describe('(Nested Shape)', () => {
      it('allows you to specify nested props as required', () => {
        const validator = nestedShape.requires(`
        foo: {
          boo,
        }
      `);
        valid(validator, { foo: { boo: 1 }});
        valid(validator, { foo: { boo: 1, bam: 2 }});
        invalid(validator, { foo: { bam: 1 }});
      });

      it('allows you to specify a nested shape without specifying which children', () => {
        var validator = nestedShape.requires(`foo`);
        valid(validator, { foo: {} });
        valid(validator, { foo: { boo: 1 } });
        invalid(validator, { bar: { qoo: 1 } });
      });

      it('allows you to specify nested props of a nested shape', () => {
        const shapeA = Shape({ foo: Types.number, bar: Types.number });
        const shapeB = Shape({ boo: shapeA, bam: Types.number });

        const validator = shapeB.requires(`boo: { foo }`);
        valid(validator, { boo: { foo: 1 }});
        invalid(validator, { boo: {}});
        invalid(validator, { bam: 2 });
      });

      it('allows you to specify nested props of a nested shape w/ requires', () => {
        const shapeA = Shape({ foo: Types.number, bar: Types.number });
        const shapeB = Shape({ boo: shapeA.requires(`bar`), bam: Types.number });

        const validator = shapeB.requires(`boo: { foo }`);
        valid(validator, { boo: { foo: 1, bar: 1 }});
        invalid(validator, { boo: { foo: 1 }});
        invalid(validator, { boo: {}});
        invalid(validator, { bam: 2 });
      });

    });

  });

  describe('.passedInto(Component, propName)', () => {

    it('throws when different original shape is used', () => {
      const Foo = { propTypes: { foo: shape.requires(`foo, bar`) } };
      expect(() => nestedShape.passedInto(Foo, 'foo')).to.throw;
    });

    describe('(Basic Shape)', () => {
      const FooBar = { propTypes: { foo: shape.requires(`foo, bar`) } };
      const BarBaz = { propTypes: { bar: shape.requires(`bar, baz`) } };
      const Foo = { propTypes: { bar: shape.requires(`foo`) } };

      it('uses the requires of the passed in component', () => {
        const validator = shape.passedInto(FooBar, 'foo');
        valid(validator, { foo: 1, bar: 1 });
        valid(validator, { foo: 1, bar: 1, baz: 3 });
        invalid(validator, { foo: 1 });
      });

      it('merges multiple components', () => {
        const validator = shape
          .passedInto(FooBar, 'foo')
          .passedInto(BarBaz, 'bar');
        valid(validator, { foo: 1, bar: 1, baz: 3 });
        invalid(validator, { foo: 1, bar: 1 });
        invalid(validator, { foo: 1 });
      });

      it('merges with .requires()', () => {
        const validator = shape
          .requires(`bar`)
          .passedInto(Foo, 'bar');
        valid(validator, { foo: 1, bar: 1, baz: 3 });
        valid(validator, { foo: 1, bar: 1 });
        invalid(validator, { baz: 1 });
        invalid(validator, { bar: 1 });
        invalid(validator, { bar: 1 });
      });
    });

    describe('(Nested Shape)', () => {
      const FooBoo = { propTypes: { foo: nestedShape.requires(`foo: { boo }`) } };
      const FooBam = { propTypes: { foo: nestedShape.requires(`foo: { bam }`) } };
      const BarQoo = { propTypes: { foo: nestedShape.requires(`bar: { qoo }`) } };

      it('merges nested shapes', () => {
        const validator = nestedShape
          .passedInto(FooBoo, 'foo');
        valid(validator, { foo: { boo: 1 }});
        invalid(validator, { foo: { bam: 1 }});
      });

      it('merges nested shapes in parallel', () => {
        const validator = nestedShape
          .passedInto(BarQoo, 'foo')
          .passedInto(FooBoo, 'foo');
        valid(validator, { foo: { boo: 1 }, bar: { qoo: 1 }});
        invalid(validator, { bar: { qoo: 1 }});
        invalid(validator, { foo: { boo: 1 }});
      });

      it('merges nested props of same shape', () => {
        const validator = nestedShape
          .passedInto(FooBoo, 'foo')
          .passedInto(FooBam, 'foo');
        valid(validator, { foo: { boo: 1, bam: 1 }});
        invalid(validator, { foo: { boo: 1 }});
        invalid(validator, { foo: { bam: 1 }});
      });


    });

  });
});
