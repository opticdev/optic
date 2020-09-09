'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.env.REACT_APP_ENABLE_ANALYTICS = 'no';
process.env.REACT_APP_TESTING_DASHBOARD = false;
process.env.OPTIC_DEMO_MODE_ENABLED = 'yes';
process.env.REACT_APP_FLATTENED_SHAPE_VIEWER = true;
require('./start');
