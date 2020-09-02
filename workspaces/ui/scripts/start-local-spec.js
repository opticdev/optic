'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.env.REACT_APP_ENABLE_ANALYTICS = 'no';
process.env.REACT_APP_API_URL = 'https://staging.infra.opticdev.com';
require('./specReqs');
require('./start');
