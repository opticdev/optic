package com.opticdev.sdk

import com.opticdev.sdk.descriptions.{Schema, SchemaId}

class SdkContext(schemas: Map[SchemaId, Schema]) {
  def lookupSchema(schemaId: SchemaId): Option[Schema] = schemas.get(schemaId)
}