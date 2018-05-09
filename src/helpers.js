function assert(test) {
  if (!test) {
    throw new Error('assertion failed!');
  }
}

function isEnumValue(o, values) {
  return isString(o) && values.includes(o.toString());
}

function isU32(o) {
  return typeof o === 'number' || o instanceof Number;
}

function isNumber(o) {
  return typeof o === 'number' || o instanceof Number;
}

function isIndex(o) {
  return typeof o === 'number' || o instanceof Number;
}

function isString(o) {
  return typeof o === 'string' || o instanceof String;
}

function isArray(o) {
  return typeof o === 'object' && o instanceof Array;
}

function isUndefined(o) {
  return typeof o === 'undefined';
}

function isInstance(o, c) {
  return o instanceof c;
}

function isOptional(o, f) {
  return isUndefined(o) || f(o);
}

function isOptionalInstance(o, c) {
  return isOptional(o, o => isInstance(o, c));
}

function isArrayWithEvery(o, f) {
  return typeof o === 'object' && o instanceof Array && o.every(f);
}

function isArrayOfInstance(o, type) {
  return isArrayWithEvery(o, x => x instanceof type);
}

function allTrue(a) {
  return a.every(x => x);
}

function areDistinct(a) {
  let set = new Set();
  for (let x of a) {
    if (set.has(x)) {
      return false;
    }
    set.add(x);
  }
  return true;
}
