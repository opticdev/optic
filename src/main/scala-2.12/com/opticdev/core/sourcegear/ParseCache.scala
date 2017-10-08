package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.core.sourcegear.graph.FileNode
import com.opticdev.parsers.{AstGraph, ParserBase}

import scala.collection.mutable

case class CacheRecord(graph: AstGraph, parser: ParserBase, fileContents: String)

class ParseCache {

  private val fileStore: mutable.Map[FileNode, CacheRecord] = collection.mutable.Map[FileNode, CacheRecord]()
  private val lastNFiles = scala.collection.mutable.Buffer[FileNode]()

  val maxCachedFiles = SGConstants.maxCachedFiles

  def cache: Map[FileNode, CacheRecord] = fileStore.toMap
  def cachedFiles: Vector[FileNode] = lastNFiles.toVector

  def add(file: FileNode, record: CacheRecord) : ParseCache = {

    //remove any records with same path and different hash
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

  def clear: ParseCache = {
    fileStore.clear()
    lastNFiles.clear()
    this
  }

}
