package com.opticdev.core.sourcegear.gears.generating

import com.opticdev.core.sourcegear.{SGContext, SourceGear}
import com.opticdev.core.sourcegear.gears.parsing.{NodeDescription, ParseAsModel, ParseGear}
import com.opticdev.core.sourcegear.project.{OpticProject, Project}
import com.opticdev.core.utils.StringUtils
import com.opticdev.marvin.common.ast.{AstArray, AstProperties, NewAstNode}
import com.opticdev.parsers._
import com.opticdev.parsers.graph.{CommonAstNode, GraphImplicits}
import play.api.libs.json.{JsArray, JsObject, JsValue}
import com.opticdev.parsers.SourceParserManager
import com.opticdev.parsers.graph.path.{PropertyPathWalker, WalkablePath}
import com.opticdev.marvin.runtime.mutators.MutatorImplicits._
import com.opticdev.marvin.runtime.mutators.NodeMutatorMap

import scala.util.Try
import scala.util.hashing.MurmurHash3

case class GenerateGear(block: String,
                        parserRef: ParserRef,
                        parseGear: ParseAsModel,
                        entryChild: NodeDescription) {

  def parser = SourceParserManager.parserById(parserRef)

  def parseResult(b: String): ParserResult = {
    if (parser.isDefined) {
      parser.get.parseString(b)
    } else throw new Error("Unable to find parser for generator")
  }

  def parseAndGetRoot(contents: String): (String, AstGraph, CommonAstNode) = {
    implicit val fileContents = contents
    implicit val astGraph = parseResult(contents).graph
    val rootNode = astGraph.nodes.toVector
      .find(node=> entryChild.matchingLoosePredicate(node.value.asInstanceOf[CommonAstNode]))
      .get.value.asInstanceOf[CommonAstNode]

    (fileContents, astGraph, rootNode)
  }

  def generateWithNewAstNode(value: JsObject)(implicit sourceGear: SourceGear): (NewAstNode, String) = {
    implicit val sourceGearContext = SGContext.forGeneration(sourceGear, parserRef)

    implicit val (fileContents, astGraph, rootNode) = parseAndGetRoot(block)

    val isMatch = parseGear.matches(rootNode, true)(astGraph, fileContents, sourceGearContext, null)
    if (isMatch.isEmpty) throw new Error("Can not generate. Snippet does not contain model "+parseGear)

    import com.opticdev.core.sourcegear.mutate.MutationImplicits._
    import com.opticdev.marvin.common.ast.OpticGraphConverter._

    //1. Generate Node

    val raw = isMatch.get.modelNode.update(value)

    //2. fill subcontainers
    val propertyPathWalker = new PropertyPathWalker(value)

    val rawWithContainersFilled = parseGear.containers.foldLeft(raw) {
      case (nodeRaw, (path, subcontainer)) => {
        val newAstNodesFromSchemaComponents = subcontainer.schemaComponents.flatMap(i=> {
          val schemaComponentValue = Try(propertyPathWalker.getProperty(i.propertyPath).get.as[JsArray]).getOrElse(JsArray.empty)
            .value.toSeq

          //@todo allow a choice to be made if there are multiple lenses that can fulfill this operation
          val gearOption = sourceGear.gearSet.listGears.find(_.schemaRef == i.schema)

          if (gearOption.isDefined) {

            val generator = gearOption.get.generater
            val nodeType = generator.entryChild.astType.name

            schemaComponentValue.map(child => {
              NewAstNode(nodeType, Map(), Some(
                gearOption.get.generater.generate(child.as[JsObject])
              ))
            })

          } else Seq()

        })

        implicit val (fileContents, astGraph, rootNode) = parseAndGetRoot(nodeRaw)

        Try {
          implicit val nodeMutatorMap = parser.get.marvinSourceInterface.asInstanceOf[NodeMutatorMap]
          val containerNode = WalkablePath(rootNode, path.path, astGraph).walk(rootNode, astGraph)

          val parent = containerNode
          val marvinAstParent = parent.toMarvinAstNode(astGraph, nodeRaw, parser.get)

          val childrenIndent = marvinAstParent.indent.next
          val newAstNodes = newAstNodesFromSchemaComponents.map(newAstNode=> newAstNode.withForcedContent(
            Some(childrenIndent.generate+newAstNode.forceContent.get)))

          val blockPropertyPath = parser.get.blockNodeTypes.getPropertyPath(parent.nodeType).get
          val array = marvinAstParent.properties.getOrElse(blockPropertyPath, AstArray()).asInstanceOf[AstArray]
          val newArray = array.children ++ newAstNodes
          val newProperties: AstProperties = marvinAstParent.properties + (blockPropertyPath -> AstArray(newArray:_*))
          val changes = marvinAstParent.mutator.applyChanges(marvinAstParent, newProperties)

          StringUtils.replaceRange(fileContents, parent.range, changes)
        }.getOrElse(nodeRaw)
      }
    }

    (NewAstNode(rootNode.nodeType.name, rootNode.getAstProperties, Some(rawWithContainersFilled)),
      rawWithContainersFilled)
  }

  def generate(value: JsObject)(implicit sourceGear: SourceGear): String =
    generateWithNewAstNode(value)._2

  def hash = {
      MurmurHash3.stringHash(block) ^
      MurmurHash3.stringHash(entryChild.toString) ^
      MurmurHash3.stringHash(parserRef.full) ^
      parseGear.hash
  }

}
