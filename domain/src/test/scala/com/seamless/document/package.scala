package com.seamless

import com.seamless.document.ReadCaseClasses.parseCaseClassesExtending

package object document {

  def rfcEvents = parseCaseClassesExtending("src/main/scala/com/seamless/contexts/rfc/Events.scala", "ContributionEvent")
  def shapesEvents = parseCaseClassesExtending("src/main/scala/com/seamless/contexts/shapes/Events.scala", "ShapesEvent")
  def requestEvents = parseCaseClassesExtending("src/main/scala/com/seamless/contexts/requests/Events.scala", "RequestsEvent")

  def rfcCommands = parseCaseClassesExtending("src/main/scala/com/seamless/contexts/rfc/Commands.scala", "RfcCommand")
  def shapesCommands = parseCaseClassesExtending("src/main/scala/com/seamless/contexts/shapes/Commands.scala", "ShapesCommand")
  def requestCommands = parseCaseClassesExtending("src/main/scala/com/seamless/contexts/requests/Commands.scala", "RequestsCommand")


}
