package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.parsers.AstGraph

import scala.collection.mutable

class ParseCache(implicit val SGConstants: SourceGearConstants) {
  private val fileStore: mutable.Map[File, AstGraph] = collection.mutable.Map[File, AstGraph]()
  private val lastNFiles = scala.collection.mutable.Buffer[File]()

  def cache: Map[File, AstGraph] = fileStore.toMap
  def cachedFiles: Vector[File] = lastNFiles.toVector

  def add(file: File, graph: AstGraph) : Unit = {
    fileStore += file -> graph

    val indexOfFile = lastNFiles.indexOf(file)
    if (indexOfFile != -1) {
      lastNFiles.remove(indexOfFile)
    }
    lastNFiles.insert(0, file)

    if (lastNFiles.size > SGConstants.parseCache)
        lastNFiles.remove(SGConstants.parseCache, lastNFiles.size - SGConstants.parseCache)

    fileStore --= fileStore.keys.filterNot(lastNFiles.contains(_))
  }

  def get(key: File): Option[AstGraph] = fileStore.get(key)

  def clear = {
    fileStore.clear()
    lastNFiles.clear()
  }

}
