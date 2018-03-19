package com.opticdev.core.sourcegear

import com.opticdev.marvin.common.ast.NewAstNode
import com.opticdev.sdk.descriptions.transformation.{StagedNode, TransformationOptions}

import scala.util.{Failure, Try}

object Render {

  def fromStagedNode(stagedNode: StagedNode)(implicit sourceGear: SourceGear) : Try[(NewAstNode, String)] = Try {

    val options = stagedNode.options.getOrElse(TransformationOptions())

    val gearOption = resolveGear(stagedNode)
    assert(gearOption.isDefined, "No gear found that can render this node.")

    val gear = gearOption.get
    val containerContents = options.containers.getOrElse(Map.empty)

    gear.renderer.renderWithNewAstNode(stagedNode.value, containerContents)
  }

  private def resolveGear(stagedNode: StagedNode)(implicit sourceGear: SourceGear) : Option[Gear] = {
    if (stagedNode.options.isDefined && stagedNode.options.get.gearId.isDefined) {
      val gearId = stagedNode.options.get.gearId.get
      sourceGear.findGear(gearId)
    } else {
      sourceGear.gearSet.listGears.find(_.schemaRef == stagedNode.schema)
    }
  }

}
