// // import {
// //   SpecFromInput,
// //   SpecVersionFrom,
// // } from "../input-helpers/compare-input-parser";
// import {
//   parseOpenAPIFromRepoWithSourcemap,
//   parseOpenAPIWithSourcemap,
// } from "../../parser/openapi-sourcemap-parser";
// import {SpecFromIn}
// import { inGit } from "../../loaders/file-on-branch";
// import * as path from "path";

// export async function compare(
//   from: SpecFromInput,
//   to: SpecFromInput,
//   rules: string
// ) {
//   const fromSpec = await specFromInputToResults(from, process.cwd());
//   const toSpec = await specFromInputToResults(to, process.cwd());
//   console.log(fromSpec, toSpec);
// }

// async function specFromInputToResults(
//   input: SpecFromInput,
//   workingDir: string = process.cwd()
// ): Promise<Result> {
//   switch (input.from) {
//     case SpecVersionFrom.empty:
//       return {
//         jsonLike: input.value,
//         sourcemap: { files: [], map: [] },
//       };
//     case SpecVersionFrom.git: {
//       const gitRepo = await inGit(path.join(workingDir, input.name));
//       if (!gitRepo) {
//         throw new Error(`${input.name} is not in a git repo`);
//       }
//       return await parseOpenAPIFromRepoWithSourcemap(
//         input.name,
//         gitRepo,
//         input.branch
//       );
//     }
//     case SpecVersionFrom.file:
//       return await parseOpenAPIWithSourcemap(input.filePath);
//   }
// }
