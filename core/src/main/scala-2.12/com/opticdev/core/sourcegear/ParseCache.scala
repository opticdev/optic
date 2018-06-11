package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.core.sourcegear.annotations.FileNameAnnotation
import com.opticdev.core.sourcegear.graph.FileNode
import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.parsers.{AstGraph, ParserBase}

import scala.collection.mutable

case class CacheRecord(graph: AstGraph, parser: ParserBase, fileContents: String, fileNameAnnotationOption: Option[FileNameAnnotation]) {
  //WARNING: Negating this does not determine equality
  def differentFrom(other: String) : Boolean = {
    other.size != fileContents.size ||
    other != fileContents
  }

  def asFileParseResults = {
    import com.opticdev.core.sourcegear.graph.GraphImplicits._
    FileParseResults(graph, graph.modelNodes.asInstanceOf[Vector[ModelNode]], parser, fileContents, fileNameAnnotationOption)
  }
}

class ParseCache {

  private val fileStore: mutable.Map[File, CacheRecord] = collection.mutable.Map[File, CacheRecord]()
  private val lastNFiles = scala.collection.mutable.Buffer[File]()

  val maxCachedFiles: Int = SGConstants.maxCachedFiles

  def cache: Map[File, CacheRecord] = fileStore.toMap
  def cachedFiles: Vector[File] = lastNFiles.toVector

  def add(file: File, record: CacheRecord) : ParseCache = {

    fileStore --= fileStore.keys.filter(_.pathAsString == file.pathAsString)
    //add new file record to map
    fileStore += file -> record

    val indexOfFile = lastNFiles.indexWhere(_.pathAsString == file.pathAsString)
    if (indexOfFile != -1) {
      lastNFiles.remove(indexOfFile)
    }

    lastNFiles.insert(0, file)

    if (lastNFiles.size > maxCachedFiles)
        lastNFiles.remove(maxCachedFiles, lastNFiles.size - maxCachedFiles)

    fileStore --= fileStore.keys.filterNot(lastNFiles.contains(_))

    this
  }

  def get(file: File): Option[CacheRecord] = fileStore.get(file)

  def isCurrentForFile(file: File, contents: String) : Boolean = {
    get(file).exists(record => !record.differentFrom(contents))
  }

  def clear: ParseCache = {
    fileStore.clear()
    lastNFiles.clear()
    this
  }

}
