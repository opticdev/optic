package com.opticdev.core.compiler.stages

import com.opticdev.core.compiler.{GeneratorFactoryOutput, SnippetStageOutput}
import com.opticdev.core.sdk.descriptions.Lens
import com.opticdev.core.sourcegear.gears.generating.GenerateGear
import com.opticdev.core.sourcegear.gears.parsing.ParseGear
import com.opticdev.core.sourceparsers.LanguageId
import com.opticdev.parsers.graph.AstPrimitiveNode


class GeneratorFactoryStage(snippetStageOutput: SnippetStageOutput, modelsParseGear: ParseGear)(implicit lens: Lens) extends CompilerStage[GeneratorFactoryOutput] {
  override def run: GeneratorFactoryOutput = {
    GeneratorFactoryOutput(new GenerateGear(
      snippetStageOutput.snippet.block,
      snippetStageOutput.snippet.languageId,
      modelsParseGear,
      snippetStageOutput.entryChildren.map(i=> ParserFactoryStage.nodeToDescription(i)(snippetStageOutput))
    ))
  }
}
