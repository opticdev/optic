package com.opticdev.core.sdk

import com.opticdev.core.sdk.descriptions.{Schema, SchemaId}

class SdkContext(schemas: Map[SchemaId, Schema]) {
  def lookupSchema(schemaId: SchemaId): Option[Schema] = schemas.get(schemaId)
}