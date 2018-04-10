package com.opticdev.common.storage

import com.opticdev.common.BuildInfo
import play.api.libs.json.Json

import scala.util.Try

object DataDirectoryConfig {
  case class ConfigStatus(opticMDVersion: String)
  private val defaultStatus = ConfigStatus(BuildInfo.opticMDVersion)

  private implicit val configStatusFormats = Json.format[ConfigStatus]

  val configLocation = DataDirectory.root / "config.json"

  def readConfigStatus = {
    DataDirectory.init
    val tryRead = Try(Json.fromJson[ConfigStatus](Json.parse(configLocation.contentAsString)).get)
    tryRead.getOrElse({
      DataDirectory.reset
      saveConfigStatus()
    })
  }

  def saveConfigStatus(configStatus: ConfigStatus = defaultStatus) : ConfigStatus = {
    DataDirectory.init
    Try(configLocation.createIfNotExists(false, true))
    configLocation.write(Json.toJson(configStatus).toString())
    configStatus
  }

  def triggerMigration : Unit = {
    if (readConfigStatus == defaultStatus) return

    if (readConfigStatus.opticMDVersion != defaultStatus.opticMDVersion) {
      //clear the markdown cache
      println("MIGRATING OPTIC MARKDOWN")
      DataDirectory.emptyFolder(DataDirectory.markdownCache)
    }

  }


}
