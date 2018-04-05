package com.opticdev.core.sourcegear.gears.rendering

import com.opticdev.core.sourcegear.{Render, SGContext, SourceGear}
import com.opticdev.core.sourcegear.gears.parsing.{NodeDescription, ParseAsModel, ParseGear}
import com.opticdev.core.sourcegear.project.{OpticProject, Project}
import com.opticdev.core.utils.StringUtils
import com.opticdev.marvin.common.ast.{AstArray, AstProperties, NewAstNode}
import com.opticdev.marvin.common.helpers.LineOperations
import com.opticdev.parsers._
import com.opticdev.parsers.graph.{CommonAstNode, GraphImplicits, WithinFile}
import play.api.libs.json.{JsArray, JsObject, JsValue}
import com.opticdev.parsers.SourceParserManager
import com.opticdev.parsers.graph.path.{PropertyPathWalker, WalkablePath}
import com.opticdev.marvin.runtime.mutators.MutatorImplicits._
import com.opticdev.marvin.runtime.mutators.NodeMutatorMap
import com.opticdev.sdk.descriptions.transformation.StagedNode
import com.opticdev.sdk.{ContainersContent, VariableMapping}

import scala.util.Try
import scala.util.hashing.MurmurHash3
import com.opticdev.marvin.common.helpers.InRangeImplicits._

case class RenderGear(block: String,
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
      .filter(node => entryChild.matchingLoosePredicate(node.value.asInstanceOf[CommonAstNode]))
      .minBy(_.value.asInstanceOf[CommonAstNode].graphDepth(astGraph)).value.asInstanceOf[CommonAstNode]

    (fileContents, astGraph, rootNode)
  }

  def renderWithNewAstNode(value: JsObject, containersContent: ContainersContent = Map.empty, variableMapping: VariableMapping = Map.empty)(implicit sourceGear: SourceGear): (NewAstNode, String) = {

    implicit val (fileContents, astGraph, rootNode) = parseAndGetRoot(block)

    implicit val sourceGearContext = SGContext.forRender(sourceGear, astGraph, parserRef)

    val isMatch = parseGear.matches(rootNode, true)(astGraph, fileContents, sourceGearContext, null)
    if (isMatch.isEmpty) throw new Error("Can not generate. Snippet does not contain model "+parseGear)

    import com.opticdev.core.sourcegear.mutate.MutationImplicits._
    import com.opticdev.marvin.common.ast.OpticGraphConverter._

    //1. Render Node

    val variableChanges = parseGear.variableManager.changesFromMapping(variableMapping)
    val raw = isMatch.get.modelNode.update(value, Some(variableChanges))

    //2. fill subcontainers
    val propertyPathWalker = new PropertyPathWalker(value)
    val rawWithContainersFilled = parseGear.containers.foldLeft(raw) {
      case (nodeRaw, (path, subcontainer)) => {

        // collect contents. If its set in a staged node override, else just map the schema components in
        val containerContents: Seq[NewAstNode] =
          if (containersContent.contains(subcontainer.name)) {
            val stagedNodes = containersContent.getOrElse(subcontainer.name, Vector())
            stagedNodes.map(staged=> Render.fromStagedNode(staged, variableMapping).get._1)
          } else {
            subcontainer.schemaComponents.flatMap(i=> {
            val schemaComponentValue = Try(propertyPathWalker.getProperty(i.propertyPath).get.as[JsArray]).getOrElse(JsArray.empty)
              .value.toSeq

            Try {
              schemaComponentValue.map(child => {
                val rendered = Render.fromStagedNode(StagedNode(i.schema, child.as[JsObject])).get
                NewAstNode(rendered._3.renderer.entryChild.astType.name, Map(), Some(rendered._2))
              })
            }.getOrElse(Seq.empty)

          })
          }

        implicit val (fileContents, astGraph, rootNode) = parseAndGetRoot(nodeRaw)

        Try {
          implicit val nodeMutatorMap = parser.get.marvinSourceInterface.asInstanceOf[NodeMutatorMap]
          val containerNode = WalkablePath(rootNode, path.path, astGraph).walk(rootNode, astGraph)

          val parent = containerNode
          val marvinAstParent = parent.toMarvinAstNode(astGraph, nodeRaw, parser.get)

          val childrenIndent = marvinAstParent.indent.next
          val newAstNodes = containerContents.map(newAstNode=> newAstNode.withForcedContent(Some(LineOperations.padAllLinesWith(childrenIndent.generate, newAstNode.forceContent.get))))

          val blockPropertyPath = parser.get.blockNodeTypes.getPropertyPath(parent.nodeType).get
          val array = marvinAstParent.properties.getOrElse(blockPropertyPath, AstArray()).asInstanceOf[AstArray]
          val newArray = array.children ++ newAstNodes
          val newProperties: AstProperties = marvinAstParent.properties + (blockPropertyPath -> AstArray(newArray:_*))
          val lastPadding = LineOperations.paddingForLastLine(fileContents.substring(parent.range))

          val changes = marvinAstParent.mutator.applyChanges(marvinAstParent, newProperties, lastPadding, Set(0))

          StringUtils.replaceRange(fileContents, parent.range, changes)

        }.getOrElse(nodeRaw)
      }
    }

    (NewAstNode(rootNode.nodeType.name, rootNode.getAstProperties, Some(rawWithContainersFilled)),
      rawWithContainersFilled)
  }

  def render(value: JsObject, containersContent: ContainersContent = Map.empty, variableMapping: VariableMapping = Map.empty)(implicit sourceGear: SourceGear): String =
    renderWithNewAstNode(value, containersContent, variableMapping)._2

  def hash = {
      MurmurHash3.stringHash(block) ^
      MurmurHash3.stringHash(entryChild.toString) ^
      MurmurHash3.stringHash(parserRef.full) ^
      parseGear.hash
  }

}
