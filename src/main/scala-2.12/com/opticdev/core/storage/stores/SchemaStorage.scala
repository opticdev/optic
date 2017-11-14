//package com.opticdev.core.storage.stores
//
//import better.files.File
//import com.opticdev.common.storage.DataDirectory
//import com.opticdev.core.sdk.descriptions.{Schema, SchemaId}
//import play.api.libs.json.Json
//
//import scala.util.Try
//
//object SchemaStorage {
//
//  def writeToStorage(schema: Schema): File = {
//    val file = DataDirectory.schemas / schema.identifier
//    file.createIfNotExists(asDirectory = false)
//    file.write(schema.schema.toString())
//  }
//
//  def loadFromStorage(schemaId: SchemaId) : Option[Schema] = {
//    val file = DataDirectory.schemas / schemaId.id
//    if (file.exists) {
//      val schemaParse = Try(Schema.fromJson(Json.parse(file.contentAsString)))
//      if (schemaParse.isSuccess) Option(schemaParse.get) else None
//    } else {
//      None
//    }
//  }
//
//}
