package com.opticdev.arrow.changes.evaluation

import better.files.File
import com.opticdev.arrow.changes.{ChangeGroup, InsertModel, RunTransformation}
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor
import play.api.libs.json.JsObject

import scala.util.Try

object Evaluation {
  def forChangeGroup(changeGroup: ChangeGroup, sourcegear: SourceGear, project: Option[OpticProject] = None) = {

    implicit val filesStateMonitor : FileStateMonitor = {
      //hook up to existing in-memory representation of files
      if (project.isDefined) new FileStateMonitor(project.get.filesStateMonitor) else new FileStateMonitor
    }

    val results = changeGroup.changes.map {
      case im: InsertModel => {
        val gearOption = sourcegear.findGear(im.gearId.get)
        assert(gearOption.isEmpty, "Gear not found for id. "+ im.gearId.get)

        val gear = gearOption.get
        val generatedNode = gear.generater.generateWithNewAstNode(im.value)(sourcegear)

        val resolvedLocation = im.atLocation.get.resolveToLocation(sourcegear).get

        val changeResult = InsertCode.atLocation(generatedNode, im.atLocation.get.file, resolvedLocation)

        if (changeResult.isSuccess) {
          changeResult.asFileChanged.stageContentsIn(filesStateMonitor)
        }

        changeResult
      }
      case rt: RunTransformation => {
        val gearOption = sourcegear.findGear(rt.gearId.get)
        assert(gearOption.isDefined, "Gear not found for id. "+ rt.gearId.get)
        val schema = sourcegear.findSchema(rt.transformationChanges.transformation.output).get

        val transformationTry = rt.transformationChanges.transformation.transformFunction.transform(rt.inputValue)
        assert(transformationTry.isSuccess, "Transformation script encountered error "+ transformationTry.failed.get)
        assert(schema.validate(transformationTry.get), "Result of transformation did not conform to schema "+ schema.schemaRef.full)

        val generatedNode = gearOption.get.generater.generateWithNewAstNode(transformationTry.get)(sourcegear)

        val resolvedLocation = rt.location.get.resolveToLocation(sourcegear).get

        val changeResult = InsertCode.atLocation(generatedNode, rt.location.get.file, resolvedLocation)

        if (changeResult.isSuccess) {
          changeResult.asFileChanged.stageContentsIn(filesStateMonitor)
        }

        changeResult

      }

    }

    BatchedChanges(results, filesStateMonitor.allStaged)
  }
}