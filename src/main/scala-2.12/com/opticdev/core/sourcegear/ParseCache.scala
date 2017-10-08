package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.core.sourcegear.graph.FileNode
import com.opticdev.parsers.AstGraph

import scala.collection.mutable

class ParseCache {

  private val fileStore: mutable.Map[FileNode, AstGraph] = collection.mutable.Map[FileNode, AstGraph]()
  private val lastNFiles = scala.collection.mutable.Buffer[FileNode]()

  val maxCachedFiles = SGConstants.maxCachedFiles

  def cache: Map[FileNode, AstGraph] = fileStore.toMap
  def cachedFiles: Vector[FileNode] = lastNFiles.toVector

  def add(file: FileNode, graph: AstGraph) : ParseCache = {

    //remove any records with same path and different hash
    fileStore --= fileStore.keys.filter(_.filePath == file.filePath)
    //add new file record to map
    fileStore += file -> graph

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

  def get(key: FileNode): Option[AstGraph] = fileStore.get(key)

  def clear: ParseCache = {
    fileStore.clear()
    lastNFiles.clear()
    this
  }

}
