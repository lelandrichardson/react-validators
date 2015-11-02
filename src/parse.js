
const COMMENTS_REGEX = /(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/gm;

const WHITESPACE_REGEX = /[\s\n]/gm;

export function stripComments(s) {
  return s.replace(COMMENTS_REGEX, '');
}

export function stripWhitespace(s) {
  return s.replace(WHITESPACE_REGEX, '');
}

export function tokenize(s) {
  var start = -1;
  var tokenLength = 0;
  var stack = [];
  var shape = {};
  var i;
  var key;

  for (i = 0; i < s.length; i++) {
    switch (s[i]) {
      case '{':
        // push onto the stack
        stack.push(shape);
        key = s.slice(start, start + tokenLength);
        shape[key] = {};
        shape = shape[key];
        start = -1;
        tokenLength = 0;
        break;

      case '}':
        // end any token (in case no lingering comma was provided)
        if (tokenLength > 0) {
          key = s.slice(start, start + tokenLength);
          shape[key] = null;
          start = -1;
          tokenLength = 0;
        }

        // pop the stack (end of nested shape)
        shape = stack.pop();
        break;

      case ',':
        // comma after nested object
        if (tokenLength === 0) continue;

        // key has ended
        key = s.slice(start, start + tokenLength);
        shape[key] = null;
        start = -1;
        tokenLength = 0;
        break;

      case ':':
        break;

      default:
        // TODO(lmr):
        // validate the characters here, and throw an error if they're
        // not allowed. Should be an alphanumeric character
        if (start === -1) start = i;
        tokenLength++;
        break;
    }
  }

  // clean up in case lingering comma wasn't included
  if (tokenLength > 0) {
    key = s.slice(start, start + tokenLength);
    shape[key] = null;
  }

  if (stack.length) {
    throw new Error("Parse Failure. Missing closing bracket.");
  }

  return shape;
}

export function parse(s) {
  s = stripComments(s);
  s = stripWhitespace(s);
  return tokenize(s);
};
