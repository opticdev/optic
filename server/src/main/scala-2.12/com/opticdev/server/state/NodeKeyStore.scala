package com.opticdev.server.state

import better.files.File
import com.opticdev.core.sourcegear.graph.model.{LinkedModelNode, ModelNode}
import com.opticdev.core.utils.UUID

import scala.collection.mutable

class NodeKeyStore {

  private val map: mutable.Map[File, mutable.Map[String, LinkedModelNode]] = mutable.Map[File, mutable.Map[String, LinkedModelNode]]()

  def leaseId(file: File, modelNode: LinkedModelNode) : String = {
    val id = UUID.generate
    val fileIdMapping = map.getOrElseUpdate(file, mutable.Map[String, LinkedModelNode]())
    fileIdMapping += id -> modelNode
    id
  }

  def invalidateFileIds(file: File) = {
    map -= file
  }

  def lookupId(id: String) : Option[LinkedModelNode] = map.values.flatten.find(_._1 == id).map(_._2)
  def lookupIdInFile(id: String, file: File) : Option[LinkedModelNode] = {
    map
      .getOrElse(file, mutable.Map[String, LinkedModelNode]())
      .get(id)
  }

  def clearAll = map.clear()

}
