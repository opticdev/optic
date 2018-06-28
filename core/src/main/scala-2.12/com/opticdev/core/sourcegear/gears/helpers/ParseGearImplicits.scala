package com.opticdev.core.sourcegear.gears.helpers

import com.opticdev.core.sourcegear.gears.parsing.ParseGear
import com.opticdev.sdk.descriptions.enums.LocationEnums
import com.opticdev.sdk.descriptions.enums.LocationEnums.InContainer
import com.opticdev.sdk.opticmarkdown2.lens.{OMComponentWithPropertyPath, OMLensSchemaComponent}

object ParseGearImplicits {

  implicit class ParseGearImplicits(parseGear: ParseGear) {

    private def containerComponents = parseGear.containers.values.flatMap(c=> c.schemaComponents)

    def allSchemaComponents: Set[OMComponentWithPropertyPath[OMLensSchemaComponent]] = {
      containerComponents.toSet
    }

  }

}
