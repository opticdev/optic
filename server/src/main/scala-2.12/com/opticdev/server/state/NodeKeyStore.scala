package com.opticdev.server.state

import better.files.File
import com.opticdev.core.sourcegear.graph.model.{LinkedModelNode, ModelNode}
import com.opticdev.core.utils.UUID

import scala.collection.mutable

class NodeKeyStore {

  private val map: mutable.Map[File, mutable.Map[String, LinkedModelNode]] = mutable.Map[File, mutable.Map[String, LinkedModelNode]]()

  def leaseId(file: File, modelNode: LinkedModelNode) : String = {
    val fileIdMapping = map.getOrElseUpdate(file, mutable.Map[String, LinkedModelNode]())

    val alreadyExists = fileIdMapping.find(_._2 == modelNode)

    if (alreadyExists.isDefined) {
      alreadyExists.get._1
    } else {
      val id = UUID.generate
      fileIdMapping += id -> modelNode
      id
    }

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
