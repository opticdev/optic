package com.opticdev.core.sourcegear

import com.opticdev.common.graph.CommonAstNode
import com.opticdev.common.graph.path.{FlatWalkablePath, WalkablePath}
import com.opticdev.sdk.skills_sdk.compilerInputs.subcontainers.OMSubContainer

package object containers {

  /* For Compiler  */
  type ContainerMapping = Map[ContainerHook, ContainerNodeMapping]

  case class ContainerNodeMapping(node: CommonAstNode, path: WalkablePath) {
    def withNode(CommonAstNode: CommonAstNode) = ContainerNodeMapping(CommonAstNode, path)
  }

  case class ContainerHook(name: String, range: Range)


  /* For Runtime */

  case class SubContainerMatch(subcontainer: OMSubContainer, CommonAstNode: CommonAstNode)
  type ContainerAstMapping = Map[String, CommonAstNode]

}
