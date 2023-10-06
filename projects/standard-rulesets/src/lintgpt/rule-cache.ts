import { PreparedRule, prepareRule } from './prepare-rule';
import crypto from 'crypto';
import fs from 'fs-extra';
import objectHash from 'object-hash';
import path from 'path';
import { AIRuleEvaluationResult, evaluateRule } from './rule-evaluation';
import { writeJson } from '@useoptic/optic/build/utils/write-to-file';
type RuleCache = {
  getOrPrepareRule: (rule: string) => Promise<PreparedRule | undefined>;
};

type LocalCacheFormat = {
  rules: { [key: string]: PreparedRule };
  evaluations: { [key: string]: AIRuleEvaluationResult };
};

export class NaiveLocalCache implements RuleCache {
  private cacheValue: LocalCacheFormat = { rules: {}, evaluations: {} };
  constructor(
    public localFile: string = path.join(process.cwd(), 'lintgpt.cache')
  ) {}
  async clear() {
    await fs.unlink(this.localFile);
  }

  async loadCache() {
    try {
      const cache = (await fs.readJSON(this.localFile)) as LocalCacheFormat;
      this.cacheValue = cache;
    } catch (e) {
      this.cacheValue = { evaluations: {}, rules: {} };
      await fs.writeJson(this.localFile, this.cacheValue);
    }
  }

  async flushCache() {
    await fs.writeJson(this.localFile, this.cacheValue);
  }
  async getOrPrepareRule(rule: string): Promise<PreparedRule | undefined> {
    const hash = crypto.createHash('sha256').update(rule, 'utf8').digest('hex');

    if (this.cacheValue.rules.hasOwnProperty(hash)) {
      return this.cacheValue.rules[hash];
    } else {
      const preparedRule = await prepareRule(rule);
      if (preparedRule) {
        this.cacheValue = {
          ...this.cacheValue,
          rules: { ...this.cacheValue.rules, [hash]: preparedRule },
        };
        return preparedRule;
      }
    }
  }

  async getOrEvaluateRule(
    preparedRule: PreparedRule,
    locationContext: string,
    value: any,
    before?: any
  ): Promise<AIRuleEvaluationResult> {
    const hash = objectHash({ preparedRule, locationContext, value, before });

    if (this.cacheValue.evaluations.hasOwnProperty(hash)) {
      return this.cacheValue.evaluations[hash];
    } else {
      try {
        const result = await evaluateRule(
          preparedRule,
          locationContext,
          value,
          before
        );
        this.cacheValue = {
          ...this.cacheValue,
          evaluations: { ...this.cacheValue.evaluations, [hash]: result },
        };
        return result;
      } catch (e) {
        // skip but don't cache
        return { skipped: true };
      }
    }
  }
}
