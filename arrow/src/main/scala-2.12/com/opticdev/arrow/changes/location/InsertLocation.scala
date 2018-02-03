package com.opticdev.arrow.changes.location

import better.files.File
import com.opticdev.parsers.graph.AstPrimitiveNode
import com.opticdev.sdk.descriptions.Container

sealed trait InsertLocation

case class AsChildOf(file: File, position: Int) extends InsertLocation
case class RawPosition(file: File, position: Int) extends InsertLocation
//case class InContainer(container: AstPrimitiveNode, atIndex: RelativeIndex = Last) extends InsertLocation
