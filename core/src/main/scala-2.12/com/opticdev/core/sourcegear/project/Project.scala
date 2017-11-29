package com.opticdev.core.sourcegear.project

import com.opticdev._
import akka.actor.{ActorRef, Kill, PoisonPill, Props}
import better.files.File
import com.opticdev.core.sourcegear.{SGConstructor, SourceGear}
import better.files._
import FileWatcher._
import java.nio.file.{Path, WatchEvent, StandardWatchEventKinds => EventType}

import akka.pattern.ask
import akka.stream.Supervision.Stop
import akka.util.Timeout
import com.opticdev.core.actorSystem

import concurrent.duration._
import com.opticdev.core.sourcegear.actors._
import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.core.sourcegear.graph.{ProjectGraph, ProjectGraphWrapper}
import com.opticdev.core.sourcegear.project.config.ProjectFile
import play.api.libs.json.{JsObject, JsString, JsValue}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Await
import scala.util.Try
import com.opticdev.core.sourcegear.project.status._

class Project(name: String, baseDirectory: File)(implicit logToCli: Boolean = false, actorCluster: ActorCluster) extends OpticProject(name, baseDirectory) {

  private var sourceGear: SourceGear = {
    projectFileChanged(projectFile)
    SourceGear.default
  }

  //do this after sourcegear is initialized

  override def projectFileChanged(newPf: ProjectFile): Unit = {
    super.projectFileChanged(newPf)
    if (newPf.interface.isSuccess) {
      SGConstructor.fromProjectFile(newPf).onComplete(i => {
        if (i.isSuccess) {
          sourceGear = i.get.inflate
          projectStatusInstance.sourceGearStatus = Valid
          if (projectStatus.monitoringStatus == Watching) rereadAll
        } else {
          projectStatusInstance.sourceGearStatus = Invalid(i.failed.get.getMessage)
        }
      })
    }
  }

  override def projectSourcegear = sourceGear

}

object Project {
  def fromProjectFile(pf: ProjectFile)(implicit actorCluster: ActorCluster) : Try[OpticProject] = Try {
    val name = pf.interface.get.name
    new Project(name.yamlValue.value, pf.file.parent)
  }
}