package com.opticdev.core.sourcegear.gears.generating

import com.opticdev.core.sourcegear.{SGContext, SourceGear}
import com.opticdev.core.sourcegear.gears.parsing.{NodeDescription, ParseAsModel, ParseGear}
import com.opticdev.core.sourcegear.project.{OpticProject, Project}
import com.opticdev.marvin.common.ast.NewAstNode
import com.opticdev.parsers._
import com.opticdev.parsers.graph.{AstPrimitiveNode, GraphImplicits}
import play.api.libs.json.{JsObject, JsValue}
import com.opticdev.parsers.SourceParserManager

import scala.util.hashing.MurmurHash3

case class GenerateGear(block: String,
                        languageId: LanguageId,
                        parseGear: ParseAsModel,
                        entryChild: NodeDescription) {

  def parseResult(b: String) = {
    val parser = SourceParserManager.parserById(languageId)
    if (parser.isDefined) {
      parser.get.parseString(block, languageId.version)
    } else throw new Error("Unable to find parser for generator")
  }

  def generateWithNewAstNode(value: JsObject)(implicit sourceGear: SourceGear): (NewAstNode, String) = {
    implicit val sourceGearContext = SGContext.forGeneration(sourceGear, languageId)

    implicit val fileContents = block
    implicit val astGraph = parseResult(block).graph
    //@todo make this work for all entry children
    val rootNode = astGraph.nodes.toVector
      .find(node=> entryChild.matchingPredicate(node.value.asInstanceOf[AstPrimitiveNode]))
      .get.value.asInstanceOf[AstPrimitiveNode]
    val isMatch = parseGear.matches(rootNode, true)(astGraph, fileContents, sourceGearContext, null)
    if (isMatch.isEmpty) throw new Error("Can not generate. Snippet does not contain model "+parseGear)

    import com.opticdev.core.sourcegear.mutate.MutationImplicits._
    import com.opticdev.marvin.common.ast.OpticGraphConverter._

    val raw = isMatch.get.modelNode.update(value)

    (NewAstNode(rootNode.nodeType.name, rootNode.getAstProperties, Some(raw)),
      raw)
  }

  def generate(value: JsObject)(implicit sourceGear: SourceGear): String =
    generateWithNewAstNode(value)._2

  def hash = {
      MurmurHash3.stringHash(block) ^
      MurmurHash3.stringHash(entryChild.toString) ^
      MurmurHash3.stringHash(languageId.toString) ^
      parseGear.hash
  }

}
