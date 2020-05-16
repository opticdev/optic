import { allScenarios } from './helpers/Scenario';

//Require all scenarios
require('./scenarios/ObjectKeys');
require('./scenarios/UnknownConversions');
require('./scenarios/Arrays');
require('./scenarios/Optionals');

console.log(`Collected ${allScenarios.length}`);
