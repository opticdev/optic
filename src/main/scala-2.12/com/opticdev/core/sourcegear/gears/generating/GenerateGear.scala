package com.opticdev.core.sourcegear.gears.generating

import com.opticdev.core.sourcegear.SourceGearContext
import com.opticdev.core.sourcegear.gears.parsing.{NodeDesc, ParseGear}
import com.opticdev.core.sourceparsers.{LanguageId, SourceParserManager}
import com.opticdev.parsers._
import com.opticdev.parsers.graph.{AstPrimitiveNode, GraphImplicits}
import play.api.libs.json.{JsObject, JsValue}


case class GenerateGear(block: String,
                        languageId: LanguageId,
                        parseGear: ParseGear,
                        entryChildren: Vector[NodeDesc]) {

  lazy val parseResult = {
    val parser = SourceParserManager.parserById(languageId)
    if (parser.isDefined) {
      parser.get.parseString(block, languageId.version)
    } else throw new Error("Unable to find parser for generator")
  }

  def generate(value: JsObject)(implicit sourceGearContext: SourceGearContext): String = {
    implicit val fileContents = block
    implicit val astGraph = parseResult.graph
    //@todo make this work for all entrychildren
    val rootNode = astGraph.nodes.toVector
      .find(node=> entryChildren.head.matchingPredicate(node.value.asInstanceOf[AstPrimitiveNode]))
      .get.value.asInstanceOf[AstPrimitiveNode]
    val isMatch = parseGear.matches(rootNode, true)
    if (isMatch.isEmpty) throw new Error("Can not generate. Snippet does not contain model "+parseGear)

    import com.opticdev.core.sourcegear.mutate.MutationImplicits._
    isMatch.get.modelNode.update(value)
  }

}
