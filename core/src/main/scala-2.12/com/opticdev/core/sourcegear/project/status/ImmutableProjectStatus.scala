package com.opticdev.core.sourcegear.project.status

import play.api.libs.json.{JsArray, JsBoolean, JsObject, JsString}

class ImmutableProjectStatus(projectStatus: ProjectStatus) {

  def loadedStatus = projectStatus.loadedStatus
  def sourceGearStatus = projectStatus.sourceGearStatus
  def monitoringStatus = projectStatus.monitoringStatus
  def configStatus = projectStatus.configStatus
  def firstPassStatus = projectStatus.firstPassStatus
  def lastUpdate = projectStatus.lastUpdate


  def sourcegearChanged(callback: (SourceGearStatus)=> Unit) = projectStatus.sourcegearChanged(callback)
  def monitoringChanged(callback: (MonitoringStatus)=> Unit) = projectStatus.monitoringChanged(callback)
  def configChanged(callback: (ConfigStatus)=> Unit) = projectStatus.configChanged(callback)
  def firstPassChanged(callback: (FirstPassStatus)=> Unit) = projectStatus.firstPassChanged(callback)
  def statusChanged(callback: (ProjectStatusCase, ImmutableProjectStatus)=> Unit) = projectStatus.statusChanged(callback)

  def isValid: Boolean = projectStatus.isValid
  def isLoading: Boolean = projectStatus.isLoading
  def isReady: Boolean = projectStatus.isReady

  def asJson = {
    val errors = errorsAsJson
    JsObject(Seq(
      "loaded" -> JsString(loadedStatus.toString),
      "sourcegear" -> JsString(sourceGearStatus.toString),
      "monitoring" -> JsString(monitoringStatus.toString),
      "config" -> JsString(configStatus.toString),
      "firstPass" -> JsString(firstPassStatus.toString),
      "lastUpdate" -> JsString(lastUpdate.time.toString),

      "isValid"-> JsBoolean(isValid),
      "isLoading"-> JsBoolean(isLoading),
      "hasErrors"-> JsBoolean(errors.value.nonEmpty),
      "errors" -> errors
    ))
  }

  def errorsAsJson : JsArray = {
    var seq = Seq[JsString]()

    configStatus match {
      case config: InvalidConfig =>
        seq = seq :+ JsString(config.error)
      case _ =>
    }

    sourceGearStatus match {
      case status: Invalid =>
        seq = seq :+ JsString(status.error)
      case _ =>
    }

    JsArray(seq)
  }

  override def toString: String = asJson.toString()
}