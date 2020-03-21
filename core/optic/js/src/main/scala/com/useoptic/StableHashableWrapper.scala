package com.useoptic

import com.useoptic.serialization.StableHashable

import scala.scalajs.js

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
class StableHashableWrapper(jsHasher: js.Function1[String, String]) {
  def hash(stableHashable: StableHashable): String = {
    stableHashable.toHash()(jsHasher)
  }
}