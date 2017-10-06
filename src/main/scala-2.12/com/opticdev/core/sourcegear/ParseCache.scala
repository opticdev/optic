package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.parsers.AstGraph

import scala.collection.mutable

class ParseCache {
  private val fileStore: mutable.Map[File, AstGraph] = collection.mutable.Map[File, AstGraph]()
  private val lastNFiles = scala.collection.mutable.Buffer[File]()

  val maxCachedFiles = SGConstants.maxCachedFiles

  def cache: Map[File, AstGraph] = fileStore.toMap
  def cachedFiles: Vector[File] = lastNFiles.toVector

  def add(file: File, graph: AstGraph) : ParseCache = {
    fileStore += file -> graph

    val indexOfFile = lastNFiles.indexOf(file)
    if (indexOfFile != -1) {
      lastNFiles.remove(indexOfFile)
    }
    lastNFiles.insert(0, file)

    if (lastNFiles.size > maxCachedFiles)
        lastNFiles.remove(maxCachedFiles, lastNFiles.size - maxCachedFiles)

    fileStore --= fileStore.keys.filterNot(lastNFiles.contains(_))

    this
  }

  def get(key: File): Option[AstGraph] = fileStore.get(key)

  def clear: ParseCache = {
    fileStore.clear()
    lastNFiles.clear()
    this
  }

}
