package com.opticdev.core.sourcegear.graph.objects

import com.opticdev.common.SchemaRef
import com.opticdev.core.sourcegear.graph.AstProjection
import com.opticdev.parsers.graph.BaseNode
import play.api.libs.json.JsObject

import scala.util.hashing.MurmurHash3

case class ObjectNode(name: String, schemaRef: SchemaRef, value: JsObject) extends AstProjection {

  override val id: String = {
    Integer.toHexString(
      MurmurHash3.stringHash(name) ^
        MurmurHash3.stringHash(schemaRef.full) ^
        MurmurHash3.stringHash(value.toString()))
  }

}