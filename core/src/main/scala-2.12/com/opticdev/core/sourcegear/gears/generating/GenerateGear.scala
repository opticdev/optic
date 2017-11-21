package com.opticdev.core.sourcegear.gears.generating

import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.gears.parsing.{NodeDescription, ParseAsModel, ParseGear}
import com.opticdev.core.sourcegear.project.{OpticProject, Project}
import com.opticdev.parsers._
import com.opticdev.parsers.graph.{AstPrimitiveNode, GraphImplicits}
import play.api.libs.json.{JsObject, JsValue}
import com.opticdev.parsers.SourceParserManager

case class GenerateGear(block: String,
                        languageId: LanguageId,
                        parseGear: ParseAsModel,
                        entryChild: NodeDescription) {

  lazy val parseResult = {
    val parser = SourceParserManager.parserById(languageId)
    if (parser.isDefined) {
      parser.get.parseString(block, languageId.version)
    } else throw new Error("Unable to find parser for generator")
  }

  def generate(value: JsObject)(implicit sourceGearContext: SGContext, project: OpticProject): String = {
    implicit val fileContents = block
    implicit val astGraph = parseResult.graph
    //@todo make this work for all entry children
    val rootNode = astGraph.nodes.toVector
      .find(node=> entryChild.matchingPredicate(node.value.asInstanceOf[AstPrimitiveNode]))
      .get.value.asInstanceOf[AstPrimitiveNode]
    val isMatch = parseGear.matches(rootNode, true)
    if (isMatch.isEmpty) throw new Error("Can not generate. Snippet does not contain model "+parseGear)

    import com.opticdev.core.sourcegear.mutate.MutationImplicits._
    isMatch.get.modelNode.update(value)
  }

}
