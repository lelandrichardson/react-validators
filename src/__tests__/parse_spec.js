import { expect } from 'chai';
import {
  parse,
  stripComments,
  stripWhitespace,
  tokenize,
  compile,
} from '../parse';

describe('stripComments()', () => {
  it('strips comments', () => {
    expect(stripComments(`// comment`)).to.equal('');
  });
});

describe('stripWhitespace()', () => {

  it('removes newlines', () => {
    expect(stripWhitespace("\nab")).to.equal("ab");
  });

  it('removes tabs', () => {
    expect(stripWhitespace("\tab")).to.equal("ab");
  });

  it('removes spaces', () => {
    expect(stripWhitespace(" a b ")).to.equal("ab");
  });

  it('strips whitespace', () => {
    expect(stripWhitespace("\n\t ab\t \nc\nd e f\ng")).to.equal("abcdefg");
  });

});

describe('tokenize()', () => {
  it('tokenizes', () => {
    expect(tokenize('foo,bar:{baz,}')).to.eql({
      foo: null,
      bar: {
        baz: null,
      },
    });
  });

  it('works with multiple nested levels', () => {
    expect(tokenize('foo:{bar:{baz:{bax,},},},')).to.eql({
      foo: {
        bar: {
          baz: {
            bax: null,
          },
        },
      },
    });
  });

  it('works without a lingering comma', () => {
    expect(tokenize('foo,bar')).to.eql({
      foo: null,
      bar: null,
    });
  });

  it('works without a lingering nested comma', () => {
    expect(tokenize('foo:{bar}')).to.eql({
      foo: {
        bar: null,
      },
    });
  });

});

describe('parse()', () => {
  it('returns hash for simple hash', () => {
    expect(parse(`
      foo,
      bar,
    `)).to.eql({
      foo: null,
      bar: null,
    });
  });

  it('returns hash for nested hash', () => {
    expect(parse(`
      foo,
      bar: {
        baz,
        bax,
      },
    `)).to.eql({
      foo: null,
      bar: {
        baz: null,
        bax: null,
      },
    });
  });

  it('accepts keys with underscores', () => {
    expect(parse(`
      foo_bar,
      bar_foo,
    `)).to.eql({
      foo_bar: null,
      bar_foo: null,
    });
  });

  it('accepts keys with hyphens', () => {
    expect(parse(`
      foo-bar,
      bar-foo,
`   )).to.eql({
      "foo-bar": null,
      "bar-foo": null,
    });
  });

  it('allows comments at the end of a line', () => {
    expect(parse(`
      foo, // some comment
      bar {
        baz, // some comment
        bax,
      },
    `)).to.eql({
        foo: null,
        bar: {
          baz: null,
          bax: null,
        },
      });
  });

  it('allows comments on their own line', () => {
    expect(parse(`
      foo,
      // this is a comment
      bar {
        baz,
        // this is another comment
        bax,
      },
    `)).to.eql({
        foo: null,
        bar: {
          baz: null,
          bax: null,
        },
      });
  });

  it('allows multiline comments', () => {
    expect(parse(`
      foo,
      /*
       *Some comments
       */
      bar {
        baz,
        bax,
      },
    `)).to.eql({
        foo: null,
        bar: {
          baz: null,
          bax: null,
        },
      });
  });

  it('allows empty lines', () => {
    expect(parse(`
      foo,


      bar {
        baz,
        bax,
      },
    `)).to.eql({
        foo: null,
        bar: {
          baz: null,
          bax: null,
        },
      });
  });

  it('works without line breaks', () => {
    expect(parse(`foo, bar`)).to.eql({
        foo: null,
        bar: null,
      });
  });
});
