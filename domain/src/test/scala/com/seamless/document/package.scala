package com.seamless

import com.seamless.document.ReadCaseClasses.parseCaseClassesExtending

package object document {

  def rfcEvents = parseCaseClassesExtending("src/main/scala/com/seamless/contexts/rfc/Events.scala", "ContributionEvent")
  def dataTypesEvents = parseCaseClassesExtending("src/main/scala/com/seamless/contexts/data_types/Events.scala", "DataTypesEvent")


}
