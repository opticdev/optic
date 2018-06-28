package com.opticdev.arrow.state

import better.files.File
import com.opticdev.core.sourcegear.graph.model.{ExpandedModelNode, LinkedModelNode}
import com.opticdev.core.utils.UUID
import com.opticdev.parsers.graph.CommonAstNode

import scala.collection.mutable

class NodeKeyStore {

  private val map: mutable.Map[File, mutable.Map[String, ExpandedModelNode]] = mutable.Map[File, mutable.Map[String, ExpandedModelNode]]()

  def leaseId(file: File, modelNode: ExpandedModelNode) : String = {
    val fileIdMapping = map.getOrElseUpdate(file, mutable.Map[String, ExpandedModelNode]())

    val alreadyExists = fileIdMapping.find(_._2 == modelNode)

    if (alreadyExists.isDefined) {
      alreadyExists.get._1
    } else {
      val id = UUID.generate
      fileIdMapping += id -> modelNode
      id
    }

  }

  def assignId(file: File, id: String, modelNode: ExpandedModelNode) : String = {
    val fileIdMapping = map.getOrElseUpdate(file, mutable.Map[String, ExpandedModelNode]())
    fileIdMapping += id -> modelNode
    id
  }

  def invalidateFileIds(file: File) = {
    map -= file
  }

  def lookupId(id: String) : Option[ExpandedModelNode] = map.values.flatten.find(_._1 == id).map(_._2)
  def lookupIdInFile(id: String, file: File) : Option[ExpandedModelNode] = {
    map
      .getOrElse(file, mutable.Map[String, ExpandedModelNode]())
      .get(id)
  }

  def clearAll = map.clear()

}
