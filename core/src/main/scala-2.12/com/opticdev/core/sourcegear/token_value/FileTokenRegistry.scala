package com.opticdev.core.sourcegear.token_value

import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.parsers.ParserBase
import com.opticdev.common.graph.{AstGraph, CommonAstNode}
import com.opticdev.parsers.token_values.{External, TokenRegistryEntry}

case class FileTokenRegistry(entries: Set[TokenRegistryEntry] = Set()) {
  //will need to make this work for scope at some point
  def get(key: String) = entries.find(_.key == key)
  def size = entries.size
  def exports: Set[External] = entries.collect{case i if i.isExternal => i.asInstanceOf[External]}
}

object FileTokenRegistry {
  def fromModelNodes(modelNodes: Vector[ModelNode], astGraph: AstGraph, parser: ParserBase): FileTokenRegistry = {

    //collects all the model nodes that are connected to tokens
    val tokenValues = modelNodes.map { case mn =>
      val rootNode = mn.resolveInGraph[CommonAstNode](astGraph).root
      parser.tokenValueHandler.evaluate(rootNode, astGraph, mn)
    }.collect {case v if v.isDefined => v.get}

    FileTokenRegistry(tokenValues.toSet)

  }
}
