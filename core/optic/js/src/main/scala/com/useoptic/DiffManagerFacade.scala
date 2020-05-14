package com.useoptic

import com.useoptic.serialization.InteractionSerialization
import com.useoptic.serialization.InteractionSerialization
import com.useoptic.types.capture.{HttpInteraction}
import com.useoptic.ux.DiffManager
import io.circe.Decoder
import io.circe.scalajs.convertJsToJson

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
object DiffManagerFacade {
  def newFromInteractions(x: js.Array[js.Any], updatedCallback: js.Function0[Unit]): DiffManager = {
    val interactions = jsArrayToInteractions(x)
    new DiffManager(interactions, () => updatedCallback())
  }

  def updateInteractions(x: js.Array[js.Any], diffManager: DiffManager) = {
    val interactions = jsArrayToInteractions(x)
    diffManager.updateInteractions(interactions)
    js.Array(interactions:_*)
  }

  def jsArrayToInteractions(x: js.Array[js.Any]): Vector[HttpInteraction] = {
    x.toVector.map(i => {
      convertJsToJson(i).right.map(InteractionSerialization.fromJson)
    }).collect { case Right(interaction) => interaction}
  }

}
