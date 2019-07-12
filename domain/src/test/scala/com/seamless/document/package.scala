package com.seamless

import com.seamless.document.ReadCaseClasses.parseCaseClassesExtending

package object document {

  def rfcEvents = parseCaseClassesExtending("src/main/scala/com/seamless/contexts/rfc/Events.scala", "ContributionEvent")
  def dataTypesEvents = parseCaseClassesExtending("src/main/scala/com/seamless/contexts/data_types/Events.scala", "DataTypesEvent")
  def requestEvents = parseCaseClassesExtending("src/main/scala/com/seamless/contexts/requests/Events.scala", "RequestsEvent")

  def rfcCommands = parseCaseClassesExtending("src/main/scala/com/seamless/contexts/rfc/Commands.scala", "RfcCommand")
  def dataTypesCommands = parseCaseClassesExtending("src/main/scala/com/seamless/contexts/data_types/Commands.scala", "DataTypesCommand")
  def requestCommands = parseCaseClassesExtending("src/main/scala/com/seamless/contexts/requests/Commands.scala", "RequestsCommand")


}
