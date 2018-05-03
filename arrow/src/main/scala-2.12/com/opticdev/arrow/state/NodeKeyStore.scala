package com.opticdev.arrow.state

import better.files.File
import com.opticdev.core.sourcegear.graph.model.LinkedModelNode
import com.opticdev.core.utils.UUID
import com.opticdev.parsers.graph.CommonAstNode

import scala.collection.mutable

class NodeKeyStore {

  private val map: mutable.Map[File, mutable.Map[String, LinkedModelNode[CommonAstNode]]] = mutable.Map[File, mutable.Map[String, LinkedModelNode[CommonAstNode]]]()

  def leaseId(file: File, modelNode: LinkedModelNode[CommonAstNode]) : String = {
    val fileIdMapping = map.getOrElseUpdate(file, mutable.Map[String, LinkedModelNode[CommonAstNode]]())

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

  def lookupId(id: String) : Option[LinkedModelNode[CommonAstNode]] = map.values.flatten.find(_._1 == id).map(_._2)
  def lookupIdInFile(id: String, file: File) : Option[LinkedModelNode[CommonAstNode]] = {
    map
      .getOrElse(file, mutable.Map[String, LinkedModelNode[CommonAstNode]]())
      .get(id)
  }

  def clearAll = map.clear()

}
