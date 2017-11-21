package com.opticdev.core.sourcegear

import com.opticdev.sdk.descriptions.{Schema, SchemaColdStorage, SchemaId}

import scala.util.hashing.MurmurHash3
import com.opticdev.core.sourcegear.serialization.PickleImplicits._

case class SGConfig(hashInt: Int,
                    parserIds : Set[String],
                    gears : Set[Gear],
                    schemas : Set[SchemaColdStorage]) {

  def hashString : String = Integer.toHexString(hashInt)
}