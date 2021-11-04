import { SynkApiCheckContext } from "./dsl";
import { ApiCheckService } from "@useoptic/api-checks";

export function newSnykApiCheckService() {
  const snykRulesService = new ApiCheckService<SynkApiCheckContext>();
  return snykRulesService;
}
