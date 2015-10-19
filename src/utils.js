'use strict';

const url = require('url');
const vocabs = require('linkeddata-vocabs');
const moment = require('moment');
const _toString = {}.toString;

module.exports = exports = {
  throwif(condition, message) {
    if (condition) throw Error(message);
  },

  define(target, key, accessor, writable) {
    let def = {
      configurable: false,
      enumerable: true
    };
    if (typeof accessor === 'function')
      def.get = accessor;
    else
      def.value = accessor;
    if (writable === true)
      def.writable = true;
    Object.defineProperty(target, key, def);
  },

  is_primitive(val) {
    return val === null ||
           val === undefined ||
           exports.is_string(val) ||
           !isNaN(val) ||
           exports.is_boolean(val);
  },

  is_string(val) {
    return typeof val === 'string' ||
           val instanceof String ||
           _toString.apply(val) === '[object String]';
  },

  is_boolean(val) {
    return typeof val === 'boolean' ||
           val instanceof Boolean ||
           _toString.apply(val) === '[object Boolean]';
  },

  is_date(val) {
    return val instanceof Date ||
           _toString.apply(val) === '[object Date]' ||
           moment.isMoment(val);
  },

  is_integer(val) {
    return !isNaN(val) &&
      isFinite(val) &&
      val > -9007199254740992 &&
      val < 9007199254740992 &&
      Math.floor(val) === val;
  },

  parsed_url(val) {
    try {
      return url.parse(val).href;
    } catch(err) {
      throw Error('Value must be a valid URL');
    }
  },

  set_date_val(key, val) {
    exports.throwif(!exports.is_date(val), key+' must be a date');
    let fmt = moment.isMoment(val) ? val.format() : val.toISOString();
    this.set(key, fmt,{type:vocabs.xsd.dateTime});
  },

  set_lang_val(key, val, lang) {
    if (lang) {
      this.set(key, val, {lang:lang});
    } else {
      this.set(key, val);
    }
  },

  set_ranged_val(key, val, min, max, type) {
    exports.throwif(isNaN(val), key + ' must be a number');
    if (!isFinite(val)) return;
    val = Math.min(max, Math.max(min, val));
    this.set(key, val, {type: type});
  },

  set_non_negative_int(key, val) {
    exports.throwif(isNaN(val), key + ' must be a number');
    if (!isFinite(val)) return;
    val = Math.max(0, Math.floor(val));
    this.set(key, val, {type: vocabs.xsd.nonNegativeInteger});
  },

  set_duration_val(key, val) {
    exports.throwif(
      isNaN(val) && !exports.is_string(val) && typeof val.humanize === 'undefined',
      key + ' must be a number or a string');
    if (typeof val.humanize === 'function') {
      this.set(key, val.toString(), {type: vocabs.xsd.duration});
    } else if (!isNaN(val)) {
      exports.set_non_negative_int.call(this, key, val);
    } else {
      this.set(key, val.toString());
    }
  }
};
