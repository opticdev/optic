package com.opticdev.core.Fixture.compilerUtils

import com.opticdev.common.PackageRef
import com.opticdev.core.compiler.SnippetStageOutput
import com.opticdev.core.compiler.stages.{FinderStage, ParserFactoryStage, SnippetStage}
import com.opticdev.sdk.descriptions._
import com.opticdev.core.sourcegear.gears.parsing.{ParseAsModel, ParseGear}
import com.opticdev.core._
import com.opticdev.core.sourcegear.containers.SubContainerManager
import com.opticdev.core.sourcegear.variables.VariableManager
import com.opticdev.opm.context.{Tree, TreeContext}
import com.opticdev.parsers.SourceParserManager
import com.opticdev.sdk.opticmarkdown2.{OMChildrenRuleType, OMSnippet}
import com.opticdev.sdk.opticmarkdown2.lens.{OMLens, OMLensComponent, OMLensVariableScopeEnum}
import play.api.libs.json.JsObject

trait ParserUtils {

  def parseGearFromSnippetWithComponents(block: String, value: Map[String, OMLensComponent], subContainers: Map[String, OMChildrenRuleType] = Map(), variables: Map[String, OMLensVariableScopeEnum] = Map()) : (ParseAsModel, OMLens) = {
    val snippet = OMSnippet("es7", block)
    implicit val lens : OMLens = OMLens(
      Some("Example"),
      "example",
      snippet,
      value,
      variables,
      subContainers,
      Left(BlankSchema),
      JsObject.empty,
      snippet.language,
      PackageRef("test:example", "0.1.1"))

    implicit val variableManager = VariableManager(lens.variablesCompilerInput, SourceParserManager.installedParsers.head.identifierNodeDesc)

    val snippetBuilder = new SnippetStage(snippet)
    val snippetOutput = snippetBuilder.run

    implicit val subcontainersManager = new SubContainerManager(lens.subcontainerCompilerInputs, snippetOutput.containerMapping)

    val finderStage = new FinderStage(snippetOutput)
    val finderStageOutput = finderStage.run

    val parserFactoryStage = new ParserFactoryStage(snippetOutput, finderStageOutput)(lens, variableManager, subcontainersManager)
    val output = parserFactoryStage.run

    (output.parseGear.asInstanceOf[ParseAsModel], lens)
  }

  def sample(block: String) : SnippetStageOutput = {
    val snippet = OMSnippet("es7", block)
    implicit val lens : OMLens = OMLens(Some("Example"), "example", snippet, Map(), Map(), Map(), Left(BlankSchema), JsObject.empty, "es7", PackageRef("test:example", "0.1.1"))
    val snippetBuilder = new SnippetStage(snippet)
    snippetBuilder.run
  }


}
