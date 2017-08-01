'use strict';
/**
 * This is copied from https://raw.githubusercontent.com/facebook/prop-types/master/checkPropTypes.js
 * However, it changes warning to actually return null or an error instead of warning.
 */

var invariant = require('fbjs/lib/invariant');
// ¯\_(ツ)_/¯
const REACT_PROP_TYPES_SECRET = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages
 *
 * @return null or Error
 */
function checkPropTypes(typeSpecs, values, location, componentName) {
  for (var typeSpecName in typeSpecs) {
    if (typeSpecs.hasOwnProperty(typeSpecName)) {
      var error;
      // Prop type validation may throw. In case they do, we don't want to
      // fail the render phase where it didn't fail before. So we log it.
      // After these have been cleaned up, we'll let them throw.
      try {
        return typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, REACT_PROP_TYPES_SECRET);
      } catch (ex) {
        return ex
      }
    }
  }
  return null;
}

module.exports = checkPropTypes;