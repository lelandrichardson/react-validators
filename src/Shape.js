import { PropTypes } from 'react';
import { parse } from './parse';
import nestedShape from './nestedShape';

const hasOwnProperty = Object.prototype.hasOwnProperty;

const SHAPE_DEF = '__rv_shape_def__';
const REQUIRE_DEF = '__rv_require_def__';
const IS_SHAPE = '__rv_is_shape__';

function coalesce(shape, required) {
  var merge = {};
  for (var key in required) {
    if (!hasOwnProperty.call(required, key)) continue;
    if (!hasOwnProperty.call(shape, key)) {
      throw new Error(`Invalid Key. '${key}' not found.`);
    }
    if (required[key] === null) {
      merge[key] = makeRequired(shape[key]);
    } else {
      // nested obj
      merge[key] = makeRequired(coalesce(shape[key], required[key]));
    }
  }
  return Object.assign({}, shape, merge);
}

function mergeRequires(a, b) {
  var key;
  var result = {};
  for (key in a) {
    if (!hasOwnProperty.call(a, key)) continue;
    result[key] = a[key];
  }
  for (key in b) {
    if (!hasOwnProperty.call(b, key)) continue;
    if (hasOwnProperty.call(result, key) && result[key] !== null) {
      result[key] = mergeRequires(result[key], b[key]);
    } else {
      result[key] = b[key];
    }
  }
  return result;
}

function makeRequired(validator) {
  if (typeof validator === 'object') {
    validator = nestedShape(validator);
  }
  return validator.isRequired || validator;
}

function packRequired(validator) {
  if (validator.isRequired) {
    if (validator[IS_SHAPE]) {
      validator.isRequired[SHAPE_DEF] = validator[SHAPE_DEF];
      validator.isRequired[REQUIRE_DEF] = validator[REQUIRE_DEF];
      validator.isRequired[IS_SHAPE] = validator[IS_SHAPE];
    }
    return validator.isRequired;
  } else {
    return validator;
  }
}

function requires(defString) {
  const requireObj = parse(defString);
  const allRequires = mergeRequires(this[REQUIRE_DEF], requireObj);
  return enhance(this[SHAPE_DEF], allRequires);
}

function passedInto(Component, propName) {
  const propType = Component.propTypes[propName];
  const allRequires = mergeRequires(this[REQUIRE_DEF], propType[REQUIRE_DEF]);
  return enhance(this[SHAPE_DEF], allRequires);
}

function enhance(def, reqDef) {
  const validator = nestedShape(coalesce(def, reqDef));
  validator[SHAPE_DEF] = def;
  validator[REQUIRE_DEF] = reqDef;
  validator[IS_SHAPE] = true;
  validator.requires = requires;
  validator.passedInto = passedInto;

  validator.isRequired = packRequired(validator);

  return validator;
}

export default function Shape(def) {
  return enhance(def, {});
}
