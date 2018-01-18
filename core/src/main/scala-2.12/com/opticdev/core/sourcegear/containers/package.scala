package com.opticdev.core.sourcegear

import com.opticdev.parsers.graph.AstPrimitiveNode
import com.opticdev.parsers.graph.path.{FlatWalkablePath, WalkablePath}
import com.opticdev.sdk.descriptions.SubContainer

package object containers {
  type ContainerMapping = Map[ContainerHook, ContainerNodeMapping]

  case class ContainerNodeMapping(node: AstPrimitiveNode, path: WalkablePath) {
    def withNode(astPrimitiveNode: AstPrimitiveNode) = ContainerNodeMapping(astPrimitiveNode, path)
  }

  case class ContainerHook(name: String, range: Range)

  case class SubContainerMatch(subcontainer: SubContainer, astPrimitiveNode: AstPrimitiveNode)


}
