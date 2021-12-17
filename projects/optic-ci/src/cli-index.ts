#!/usr/bin/env node
import { makeCiCliWithNamedRules, rulesets } from '@useoptic/api-checks';

const cli = makeCiCliWithNamedRules('optic-ci', rulesets);

cli.parse(process.argv);
