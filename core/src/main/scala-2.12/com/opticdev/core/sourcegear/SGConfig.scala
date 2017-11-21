package com.opticdev.core.sourcegear

import com.opticdev.sdk.descriptions.{Schema, SchemaColdStorage, SchemaId}

import scala.util.hashing.MurmurHash3
import com.opticdev.core.sourcegear.serialization.PickleImplicits._
import play.api.libs.json.{JsObject, Json}

case class SGConfig(hashInt: Int,
                    parserIds : Set[String],
                    gears : Set[Gear],
                    schemas : Set[SchemaColdStorage]) {

  def hashString : String = Integer.toHexString(hashInt)

  def inflate : SourceGear = {
    val inflatedSchemas = schemas.map(i=>
      Schema.fromJson(Json.parse(i.data).as[JsObject]))
    new SourceGear {
      override val parsers = Set() //@todo impl
      override val gearSet = new GearSet(gears.toSeq: _*)
      override val schemas = inflatedSchemas
    }
  }

}