package com.opticdev.common.storage

import com.opticdev.common.BuildInfo
import play.api.libs.json.Json

import scala.util.Try

object DataDirectoryConfig {
  case class ConfigStatus(opticSkillsSDKVersion: String, knownProjects: Seq[String])
  private val defaultStatus = ConfigStatus(BuildInfo.skillsSDKVersion, Seq())

  private implicit val configStatusFormats = Json.format[ConfigStatus]

  val configLocation = DataDirectory.root / "config.json"

  def readConfigStatus: ConfigStatus = {
    DataDirectory.init
    val tryRead = Try(Json.fromJson[ConfigStatus](Json.parse(configLocation.contentAsString)).get)
    tryRead.getOrElse({
      DataDirectory.reset
      saveConfigStatus()
    })
  }

  def addKnownProject(configYmlPath: String) = {
    val current = readConfigStatus
    val withNewPath = (configYmlPath +: current.knownProjects).distinct.splitAt(6)._1 //dedupe and limit to 6
    saveConfigStatus(current.copy(knownProjects = withNewPath))
  }

  def saveConfigStatus(configStatus: ConfigStatus = defaultStatus) : ConfigStatus = {
    DataDirectory.init
    Try(configLocation.createIfNotExists(false, true))
    configLocation.write(Json.toJson(configStatus).toString())
    configStatus
  }

  def triggerMigration : Unit = {
    if (readConfigStatus == defaultStatus) return

    if (readConfigStatus.opticSkillsSDKVersion != defaultStatus.opticSkillsSDKVersion) {
      //clear the markdown, package & sg cache
      println("MIGRATING OPTIC MARKDOWN")
      DataDirectory.reset
      saveConfigStatus()
    }

  }


}
