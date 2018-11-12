package com.opticdev.core.sourcegear.token_value

import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.parsers.ParserBase
import com.opticdev.common.graph.{AstGraph, CommonAstNode}
import com.opticdev.core.sourcegear.SGContext
import com.opticdev.parsers.token_values.{External, Imported, TokenRegistryEntry}

case class FileTokenRegistry(entries: Set[TokenRegistryEntry] = Set()) {
  def size = entries.size
  def exports: Set[External] = entries.collect{case i if i.isExternal => i.asInstanceOf[External]}

  def get(key: String): Option[TokenRegistryEntry] = entries.find(_.key == key)
  def getExpanded(key: String)(implicit sourceGearContext: SGContext): Option[TokenRegistryEntry] = {
    val localResult = get(key)
    if (localResult.isEmpty) {
      val registry = expandedRegistry(sourceGearContext)
      val remoteResult = registry.find(_.key == key)
      remoteResult
    } else localResult
  }

  def expandedRegistry(implicit sourceGearContext: SGContext) = {
    val projectGraph = sourceGearContext.project.projectGraph
    val importsByFile = sourceGearContext.fileImportsRegistry.byFile
    import com.opticdev.core.sourcegear.graph.GraphImplicits._

    importsByFile.flatMap { case (file, imports) =>
      val exports = projectGraph.exportsForFile(file)
      val sgContext = SGContext.forFile(file)(sourceGearContext.project.actorCluster, sourceGearContext.project).get
      exports.collect { case i if imports.exists(_.local == i.local) => Imported[SGContext](i.local, i.modelNode, file, sgContext) }
    }.toSet
  }
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

protected case class FileTokenRegistryResult(key: String, local: Boolean, astGraph: AstGraph)
