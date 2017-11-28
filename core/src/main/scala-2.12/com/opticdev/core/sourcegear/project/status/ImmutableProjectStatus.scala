package com.opticdev.core.sourcegear.project.status

class ImmutableProjectStatus(projectStatus: ProjectStatus) {

  def sourceGearStatus = projectStatus.sourceGearStatus
  def monitoringStatus = projectStatus.monitoringStatus
  def configStatus = projectStatus.configStatus
  def firstPass = projectStatus.firstPass
  def lastUpdate = projectStatus.lastUpdate


  def sourcegearChanged(callback: (SourceGearStatus)=> Unit) = projectStatus.sourcegearChanged(callback)
  def monitoringChanged(callback: (MonitoringStatus)=> Unit) = projectStatus.monitoringChanged(callback)
  def configChanged(callback: (ConfigStatus)=> Unit) = projectStatus.configChanged(callback)
  def firstPassChanged(callback: (FirstPassStatus)=> Unit) = projectStatus.firstPassChanged(callback)

}