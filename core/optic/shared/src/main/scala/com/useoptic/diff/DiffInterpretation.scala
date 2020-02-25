package com.useoptic.diff

import com.useoptic.contexts.rfc.Commands.RfcCommand

case class InteractiveDiffInterpretation(title: String, description: String, commands: Seq[RfcCommand])
