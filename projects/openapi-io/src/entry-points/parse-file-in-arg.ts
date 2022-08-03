import { parseOpenAPIWithSourcemap } from "../index";

async function parse(file: string) {
  const results = await parseOpenAPIWithSourcemap(file);
  console.log(JSON.stringify(results.jsonLike, null, 1));
}

parse(process.argv[2]);
