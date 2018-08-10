package com.opticdev.cli.commands

import akka.actor.ActorSystem
import better.files.File
import com.opticdev.common.storage.DataDirectory
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.graph.model.{FlatModelNode, ModelNode, MultiModelNode}
import com.opticdev.core.sourcegear.project.status.{Complete, InProgress, Invalid, Valid}
import com.opticdev.core.sourcegear.project.{OpticProject, Project}
import com.opticdev.parsers

import scala.concurrent.ExecutionContext.Implicits.global
import com.opticdev.parsers.SourceParserManager
import play.api.libs.json.{JsArray, JsObject, Json}

import scala.util.{Success, Try}

object DumpGraph {

  def run(pwd: File, bashScript: Option[String] = None) = {

    DataDirectory.init

    SourceParserManager.enableParser(new parsers.es7.OpticParser)
    SourceParserManager.enableParser(new parsers.scala.OpticParser)

    implicit val actorCluster = new ActorCluster(ActorSystem("cli-system"))
    val projectOption = lookupProject(pwd)
    if (projectOption.isSuccess) {

      projectOption.get.watch

      val project = projectOption.get

      println(s"Loading Project: ${project.name} at ${project.projectFile.file.pathAsString}")

      project.projectStatus.statusChanged((changed, status)=> {
        changed match {
          case Valid => println("Skills Compiled...")
          case InProgress => println("Reading Project...")
          case Complete => {
            println("")
            println(Console.GREEN + "Finished Reading Project" + Console.RESET)
            finished(project, bashScript)
          }
          case Invalid(error) => {
            println(Console.RED + "invalid project config: "+ error + Console.RESET)
            actorCluster.actorSystem.terminate()
          }
          case _ =>
        }
      })

    } else {
      println(Console.RED + projectOption.failed.get.getMessage + Console.RESET)
      actorCluster.actorSystem.terminate()
    }

  }

  def finished(project: OpticProject, bashScript: Option[String])(implicit actorCluster: ActorCluster) = {
    println("Snapshoting Project")
    project.snapshot.onComplete(snapshotOption=> {
      if (snapshotOption.isSuccess) {
        val snapshot = snapshotOption.get
        val allModelNodes = snapshot.expandedValues.map {
          case (mn: FlatModelNode, ev: JsObject) =>
            DumpGraphOutput(
              mn.objectRef.map(_.name),
              mn.schemaId,
              mn.lensRef,
              ev,
              project.trimAbsoluteFilePath(snapshot.contextForNode(mn).file.pathAsString))
        }

        val json = JsObject(Seq(
          "projectInfo" -> project.projectInfo.asJson,
          "results" -> JsArray(allModelNodes.map(i=> Json.toJson[DumpGraphOutput](i)).toSeq)
        ))


        if (bashScript.isDefined) {
          import sys.process._
          println("Piping project json into: "+bashScript.get)
          println("")
          val b = Try(Seq("bash", "-l", "-c", s"""${bashScript.get} '${json}'""").!!)
          b.foreach(println)
        } else {
          println("\n")
          println(Json.prettyPrint(json))
        }

        exit

      } else {
        println(Console.RED + "Unknown error encountered when building project snapshot" + Console.RESET)
        exit
      }
    })
  }


  def exit(implicit actorCluster: ActorCluster) = {
    actorCluster.actorSystem.terminate()
    System.exit(0)
  }


  def lookupProject(includedFile: File)(implicit actorCluster: ActorCluster) : Try[OpticProject] = Try {
    import com.opticdev.core.utils.FileInPath._

    //check for an optic package in a parent directory
    val projectFileOption = includedFile.projectFileOption
    if (projectFileOption.isDefined) {
      return Success(Project.fromProjectFile(projectFileOption.get).get)
    }

    throw new Error("No optic project found in file tree "+includedFile.pathAsString+"")
  }

}
