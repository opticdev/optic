package com.opticdev.arrow.changes.evaluation

import better.files.File
import com.opticdev.arrow.changes.{ChangeGroup, InsertModel}
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor

object Evaluation {
  def forChangeGroup(changeGroup: ChangeGroup, sourcegear: SourceGear, project: Option[OpticProject] = None) = {

    implicit val filesStateMonitor : FileStateMonitor = {
      //hook up to existing in-memory representation of files
      if (project.isDefined) new FileStateMonitor(project.get.filesStateMonitor) else new FileStateMonitor
    }

    val results = changeGroup.changes.map {
      case im: InsertModel => {
        val gearOption = sourcegear.findGear(im.gearId.get)
        if (gearOption.isEmpty) throw new Exception("Gear not found for id. "+ im.gearId.get)

        val gear = gearOption.get
        val generatedNode = gear.generater.generateWithNewAstNode(im.value)(sourcegear)

        val location = im.atLocation.resolveToLocation(sourcegear).get

        val changeResult = InsertCode.atLocation(generatedNode, im.atLocation.file, location)

        if (changeResult.isSuccess) {
          changeResult.asFileChanged.stageContentsIn(filesStateMonitor)
        }

        changeResult
      }
    }

    BatchedChanges(results, filesStateMonitor.allStaged)
  }
}