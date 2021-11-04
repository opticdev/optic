import { newSnykApiCheckService } from "./service";

const snykRules = newSnykApiCheckService();
snykRules.cli("sweater-comb");
