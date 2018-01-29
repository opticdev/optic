package com.opticdev

import com.opticdev.core.sourcegear.Gear
import com.opticdev.sdk.descriptions.{Schema}

package object arrow {

  sealed trait Result {
    val score : Int
    require(score >= 0 && score <= 100, "scores must be between 0 & 1")
  }

  case class GearResult(gear: Gear, score: Int) extends Result
  case class SchemaResult(schema: Schema, score: Int) extends Result

}
