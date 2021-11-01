import { ApiCheckService } from "@useoptic/api-checks";
import { SynkApiCheckContext } from "./dsl";

export function newSnykApiCheckService() {
  return new ApiCheckService<SynkApiCheckContext>();
}
