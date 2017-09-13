import PropTypes from 'prop-types';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export default function nestedShape(shape) {
  var result = {};
  for (var key in shape) {
    if (!hasOwnProperty.call(shape, key)) continue;
    if (typeof shape[key] !== 'function') {
      result[key] = nestedShape(shape[key]);
    } else {
      result[key] = shape[key];
    }
  }
  if (process.env.NODE_ENV === 'production') {
    const shape = () => {};
    shape.isRequired = () => {};
    return shape;
  } else {
    return PropTypes.shape(result);
  }
}
