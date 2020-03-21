package com.useoptic
import com.useoptic.serialization.StableHashable

import scala.scalajs.js
class ToHashHelper(jsHasher: js.Function1[String, String]) {
  def hash(stableHashable: StableHashable): String = {
    stableHashable.toHash()(jsHasher)
  }
}
