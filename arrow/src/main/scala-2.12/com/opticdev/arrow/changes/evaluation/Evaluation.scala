package com.opticdev.arrow.changes.evaluation

import better.files.File
import com.opticdev.arrow.changes._
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor
import com.opticdev.marvin.common.helpers.LineOperations
import com.opticdev.sdk.descriptions.transformation.SingleModel
import play.api.libs.json.JsObject

import scala.util.Try

object Evaluation {

  def forChange(opticChange: OpticChange, sourcegear: SourceGear, project: Option[OpticProject] = None)(implicit filesStateMonitor: FileStateMonitor): ChangeResult = opticChange match {
    case im: InsertModel => {
      val gearOption = sourcegear.findGear(im.gearId.get)
      assert(gearOption.isDefined, "Gear not found for id. "+ im.gearId.get)

      val gear = gearOption.get
      val generatedNode = gear.renderer.renderWithNewAstNode(im.value)(sourcegear)

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
      assert(schema.validate(transformationTry.get.asInstanceOf[SingleModel].value), "Result of transformation did not conform to schema "+ schema.schemaRef.full)

      val generatedNode = gearOption.get.renderer.renderWithNewAstNode(transformationTry.get.asInstanceOf[SingleModel].value)(sourcegear)

      val resolvedLocation = rt.location.get.resolveToLocation(sourcegear).get

      val changeResult = InsertCode.atLocation(generatedNode, rt.location.get.file, resolvedLocation)

      if (changeResult.isSuccess) {
        changeResult.asFileChanged.stageContentsIn(filesStateMonitor)
      }

      changeResult

    }


    //cleanup
    case cSL: ClearSearchLines => {
      val fileContentsOption = filesStateMonitor.contentsForFile(cSL.file)
      if (fileContentsOption.isSuccess) {
        val lines = fileContentsOption.get.linesWithSeparators.toVector
        val searchIndices = lines.zipWithIndex.filter(i=> cSL.regex.findFirstIn(i._1).nonEmpty ).map(_._2).reverse

        val newLines = searchIndices.foldLeft(lines) {
          case (lines, i) => lines.patch(i, Seq("\n"), 1) //replace with empty line
        }

        val changeResult = FileChanged(cSL.file, newLines.mkString)

        if (changeResult.isSuccess) {
          changeResult.asFileChanged.stageContentsIn(filesStateMonitor)
        }

        changeResult

      } else {
        NoChanges
      }
    }
  }

  def forChangeGroup(changeGroup: ChangeGroup, sourcegear: SourceGear, project: Option[OpticProject] = None) = {

    implicit val filesStateMonitor : FileStateMonitor = {
      //hook up to existing in-memory representation of files
      if (project.isDefined) new FileStateMonitor(project.get.filesStateMonitor) else new FileStateMonitor
    }

    val results = changeGroup.changes.map(c=> forChange(c, sourcegear, project))

    BatchedChanges(results, filesStateMonitor.allStaged)
  }
}