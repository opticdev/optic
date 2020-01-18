package com.useoptic

import com.useoptic.document.ReadCaseClasses.parseCaseClassesExtending

package object document {

  def rfcEvents = parseCaseClassesExtending("src/main/scala/com/useoptic/contexts/rfc/Events.scala", "ContributionEvent")
  def shapesEvents = parseCaseClassesExtending("src/main/scala/com/useoptic/contexts/shapes/Events.scala", "ShapesEvent")
  def requestEvents = parseCaseClassesExtending("src/main/scala/com/useoptic/contexts/requests/Events.scala", "RequestsEvent")

  def rfcCommands = parseCaseClassesExtending("src/main/scala/com/useoptic/contexts/rfc/Commands.scala", "RfcCommand")
  def shapesCommands = parseCaseClassesExtending("src/main/scala/com/useoptic/contexts/shapes/Commands.scala", "ShapesCommand")
  def requestCommands = parseCaseClassesExtending("src/main/scala/com/useoptic/contexts/requests/Commands.scala", "RequestsCommand")


}
