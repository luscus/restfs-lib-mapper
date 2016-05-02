'use strict';

var http = require('http');

exports.ALLOWED_VERBS = http.METHODS;

exports.isHttpVerb    = function isHttpVerb (candidate) {
  return (exports.ALLOWED_VERBS.indexOf(candidate.toString()) > -1);
};

exports.getOptions = function getOptions (verbpath) {
  var verb = require(verbpath);
  var info = verb;

  if (!info.plugable) {
    info.plugable = false;
  }

  if (!info.accept) {
    info.accept = ['application/json'];
  }

  if (!info['accept-charset']) {
    info['accept-charset'] = ['utf-8'];
  }

  return info;
};
