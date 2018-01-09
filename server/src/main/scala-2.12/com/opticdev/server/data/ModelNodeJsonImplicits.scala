package com.opticdev.server.data

import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.actors.ParseSupervisorSyncAccess
import com.opticdev.core.sourcegear.graph.model.LinkedModelNode
import com.opticdev.server.state.ProjectsManager
import com.vdurmont.semver4j.Semver
import com.vdurmont.semver4j.Semver.SemverType
import play.api.libs.json.{JsNumber, JsObject, JsString}

import scala.util.Try

object ModelNodeJsonImplicits {

  implicit class ModelNodeJson(modelNode: LinkedModelNode) {

    def asJson()(implicit projectsManager: ProjectsManager) : JsObject = {

      val fileNode = modelNode.fileNode

      implicit val project = projectsManager.lookupProject(fileNode.get.toFile).get
      implicit val sourceGear = project.projectSourcegear
      implicit val actorCluster = projectsManager.actorCluster
      implicit val sourceGearContext: SGContext = ParseSupervisorSyncAccess.getContext(fileNode.get.toFile).get

      //@todo factor this out
      val schemaOption = {
        val project = modelNode.project

        val possibleMatches = project.projectSourcegear.schemas.filter(i=>
          i.schemaRef.packageRef.name == modelNode.schemaId.packageRef.name &&
          i.schemaRef.id == modelNode.schemaId.id)

        val targetVersion = modelNode.schemaId.packageRef.version

        val withVersions = possibleMatches.filter(i=> {
          val semVer = Try(new Semver(i.schemaRef.packageRef.version, SemverType.NPM))
          if (semVer.isSuccess) semVer.get.satisfies(targetVersion) || targetVersion == "latest" else false
        }).toVector.sortWith((a, b)=> {
          new Semver(a.schemaRef.packageRef.version, SemverType.NPM).isGreaterThan(
          new Semver(b.schemaRef.packageRef.version, SemverType.NPM))
        })

        withVersions.headOption
      }

      println(schemaOption)

      JsObject(Seq(
        "id" -> JsString(projectsManager.nodeKeyStore.leaseId(fileNode.get.toFile, modelNode)),
        "schema" -> schemaOption.get.definition,
        "astLocation" -> JsObject(Seq(
          "type" -> JsString(modelNode.root.nodeType.asString),
          "start" -> JsNumber(modelNode.root.range.start),
          "end" -> JsNumber(modelNode.root.range.end)
        )),
        //@todo make this exapanded context
//        "value" -> modelNode.value
        "value" -> modelNode.expandedValue()
      ))

    }

  }

}
