package com.opticdev.core.sourcegear.containers

import com.opticdev.sdk.descriptions.finders.NodeFinder
import com.opticdev.sdk.descriptions.{ChildrenRule, Rule, SubContainer}

class SubContainerManager(subcontainers: Vector[SubContainer], containerMapping: ContainerMapping) {


  def rules : Vector[Rule] = {

    subcontainers.flatMap(i=> {
      val hookMappingOption = containerMapping.find(_._1.name == i.name)

      if (hookMappingOption.isEmpty) throw new Exception("No Container Hook defined for "+ i.name)

      val hook = hookMappingOption.get

      Vector(ChildrenRule(NodeFinder(hook._2.node.nodeType, hook._2.node.range), i.childrenRule))
    })

  }

}

object SubContainerManager {
  def empty : SubContainerManager = new SubContainerManager(Vector(), Map())
}