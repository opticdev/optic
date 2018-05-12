package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.core.sourcegear.graph.FileNode
import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.parsers.{AstGraph, ParserBase}

import scala.collection.mutable

case class CacheRecord(graph: AstGraph, parser: ParserBase, fileContents: String) {
  //WARNING: Negating this does not determine equality
  def differentFrom(other: String) : Boolean = {
    other.size != fileContents.size ||
    other != fileContents
  }

  def asFileParseResults = {
    import com.opticdev.core.sourcegear.graph.GraphImplicits._
    FileParseResults(graph, graph.modelNodes.asInstanceOf[Vector[ModelNode]], parser, fileContents)
  }
}

class ParseCache {

  private val fileStore: mutable.Map[FileNode, CacheRecord] = collection.mutable.Map[FileNode, CacheRecord]()
  private val lastNFiles = scala.collection.mutable.Buffer[FileNode]()

  val maxCachedFiles: Int = SGConstants.maxCachedFiles

  def cache: Map[FileNode, CacheRecord] = fileStore.toMap
  def cachedFiles: Vector[FileNode] = lastNFiles.toVector

  def add(file: FileNode, record: CacheRecord) : ParseCache = {

    fileStore --= fileStore.keys.filter(_.filePath == file.filePath)
    //add new file record to map
    fileStore += file -> record

    val indexOfFile = lastNFiles.indexWhere(_.filePath == file.filePath)
    if (indexOfFile != -1) {
      lastNFiles.remove(indexOfFile)
    }
    lastNFiles.insert(0, file)

    if (lastNFiles.size > maxCachedFiles)
        lastNFiles.remove(maxCachedFiles, lastNFiles.size - maxCachedFiles)

    fileStore --= fileStore.keys.filterNot(lastNFiles.contains(_))

    this
  }

  def get(key: FileNode): Option[CacheRecord] = fileStore.get(key)

  def isCurrentForFile(fileNode: FileNode, contents: String) : Boolean = {
    get(fileNode).exists(record => !record.differentFrom(contents))
  }

  def clear: ParseCache = {
    fileStore.clear()
    lastNFiles.clear()
    this
  }

}
