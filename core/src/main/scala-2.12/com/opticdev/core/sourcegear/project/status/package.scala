package com.opticdev.core.sourcegear.project

import java.util.Date

package object status {

  sealed trait ProjectStatusCase

  sealed trait LoadedStatusCase
  case object Loaded extends LoadedStatusCase
  case object NotLoaded extends LoadedStatusCase

  sealed trait SourceGearStatus extends ProjectStatusCase
  case object Empty extends SourceGearStatus
  case object Valid extends SourceGearStatus
  case class Invalid(error: String) extends SourceGearStatus

  sealed trait MonitoringStatus extends ProjectStatusCase
  case object Watching extends MonitoringStatus
  case object NotWatching extends MonitoringStatus

  sealed trait ConfigStatus extends ProjectStatusCase
  case object ValidConfig extends ConfigStatus
  case class InvalidConfig(error: String) extends ConfigStatus

  sealed trait FirstPassStatus extends ProjectStatusCase
  case object NotStarted extends FirstPassStatus
  case object InProgress extends FirstPassStatus
  case object Complete extends FirstPassStatus

  case class LastUpdateDate(time: Date) extends ProjectStatusCase

}
