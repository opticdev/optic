package com.useoptic.diff

import com.useoptic.contexts.rfc.Commands.RfcCommand

import scala.scalajs.js.annotation.JSExportAll

@JSExportAll
case class InteractiveDiffInterpretation(title: String, description: String, commands: Seq[RfcCommand])
