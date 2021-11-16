import { ApiCheckService } from "./sdk/api-check-service";
import { ExampleDslContext } from "./sdk/test/example-dsl";
import { makeCiCli } from "./ci-cli/make-cli";

const checker: ApiCheckService<ExampleDslContext> =
  new ApiCheckService<ExampleDslContext>();

const cli = makeCiCli("play-thing", checker);

cli.parse(process.argv);
