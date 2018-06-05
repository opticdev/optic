package com.opticdev.core.sourcegear.gears.helpers

import com.opticdev.core.sourcegear.gears.parsing.ParseGear
import com.opticdev.sdk.descriptions.{Location, SchemaComponent}
import com.opticdev.sdk.descriptions.enums.LocationEnums
import com.opticdev.sdk.descriptions.enums.LocationEnums.InContainer

object ParseGearImplicits {

  implicit class ParseGearImplicits(parseGear: ParseGear) {

    private def lensComponents = parseGear.components.flatMap(_._2).filter(_.isInstanceOf[SchemaComponent]).map(i=> i.asInstanceOf[SchemaComponent].withLocation(Location(LocationEnums.InCurrentLens))).toSet
    private def containerComponents = parseGear.containers.values.flatMap(c=> c.schemaComponents.map(_.withLocation(Location(InContainer(c.name))))).toSet

    def allSchemaComponents : Set[SchemaComponent] = {
      lensComponents ++ containerComponents
    }

  }

}
