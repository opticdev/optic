package com.opticdev.core.compiler.stages

import com.opticdev.core.compiler.{RenderFactoryOutput, SnippetStageOutput}
import com.opticdev.sdk.descriptions.Lens
import com.opticdev.core.sourcegear.gears.rendering.RenderGear
import com.opticdev.core.sourcegear.gears.parsing.{ParseAsModel, ParseGear}
import com.opticdev.parsers.graph.CommonAstNode


class RenderFactoryStage(snippetStageOutput: SnippetStageOutput, modelsParseGear: ParseGear)(implicit lens: Lens) extends CompilerStage[RenderFactoryOutput] {
  override def run: RenderFactoryOutput = {
    RenderFactoryOutput(new RenderGear(
      snippetStageOutput.snippet.block,
      snippetStageOutput.snippet.languageId,
      modelsParseGear.asInstanceOf[ParseAsModel],
      snippetStageOutput.entryChildren.map(i=> ParserFactoryStage.nodeToDescription(i)(snippetStageOutput)).head,
      lens.packageRef.packageId
    ))
  }
}
