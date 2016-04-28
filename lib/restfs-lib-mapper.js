'use strict';

const merge   = require('merge');
const Crawler = require('fs-crawler');
const path    = require('path');
const api     = require('./api');

exports.map = function map (apiAbsolutePath, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options  = {};
  }

  var apiEndpointPath = apiAbsolutePath + path.sep + 'api';
  var apiModulePath   = apiAbsolutePath + path.sep + 'modules';

  var apiMap          = api.getInfo(apiEndpointPath, options);
  var apiRoot         = apiMap.alias || apiMap.name;
  apiMap.modules      = api.module.load(apiModulePath);

  var crawler         = new Crawler();
  crawler.setEncoding('utf8');

  crawler.crawlTree(apiEndpointPath, {});

  crawler.on('data', function processApiParts (data) {
    data = JSON.parse(data);

    if (!data.is.directory) {

      var filepath  = data.path.replace(apiEndpointPath, '');
      var extention = path.extname(filepath);
      var filename  = path.basename(filepath, extention);
      var route     = path.dirname(filepath);
      var verbinfo  = null;

      if (filename === 'EndpointConfig') {
        apiMap.routes[route] = merge.recursive(
          true,
          api.endpoint.getInfo(data.path),
          api.route.getInfo(route, apiRoot)
        );
      }

      if (api.endpoint.verb.isHttpVerb(filename)) {
        verbinfo = api.endpoint.verb.getOptions(data.path);
      }

      if (!apiMap.routes[route] && verbinfo) {
        // add new route
        apiMap.routes[route] = api.route.getInfo(route, apiRoot);
      }

      if (verbinfo) {
        // extend existing route
        apiMap.routes[route].verbs[filename] = verbinfo;
      }
    }

    crawler._read();
  });

  crawler.on('end', function mappingEnded (duration) {
    callback(apiMap, duration);
 });
};
