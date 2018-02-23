package com.opticdev.core.sourcegear

import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.parsers.graph.path.{FlatWalkablePath, WalkablePath}
import com.opticdev.sdk.descriptions.SubContainer

package object containers {

  /* For Compiler  */
  type ContainerMapping = Map[ContainerHook, ContainerNodeMapping]

  case class ContainerNodeMapping(node: CommonAstNode, path: WalkablePath) {
    def withNode(CommonAstNode: CommonAstNode) = ContainerNodeMapping(CommonAstNode, path)
  }

  case class ContainerHook(name: String, range: Range)


  /* For Runtime */

  case class SubContainerMatch(subcontainer: SubContainer, CommonAstNode: CommonAstNode)
  type ContainerAstMapping = Map[String, CommonAstNode]

}
