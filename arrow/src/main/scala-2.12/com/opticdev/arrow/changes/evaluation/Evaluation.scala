package com.opticdev.arrow.changes.evaluation

import better.files.File
import com.opticdev.arrow.changes.{ChangeGroup, InsertModel}
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor

object Evaluation {
  def forChangeGroup(changeGroup: ChangeGroup, sourcegear: SourceGear) = {

    implicit val filesStateMonitor : FileStateMonitor = new FileStateMonitor

    val results = changeGroup.changes.map {
      case im: InsertModel => {
        val gearOption = sourcegear.findGear(im.gearId.get)
        if (gearOption.isEmpty) throw new Exception("Gear not found for id. "+ im.gearId.get)

        val gear = gearOption.get
        val generatedCode = gear.generater.generate(im.value)(sourcegear)

        val location = im.atLocation.resolveToLocation(sourcegear).get

        val changeResult = InsertCode.atLocation(generatedCode, im.atLocation.file, location)

        if (changeResult.isSuccess) {
          changeResult.asFileChanged.stageContentsIn(filesStateMonitor)
        }

        changeResult
      }
    }

    BatchedChanges(results, filesStateMonitor.allStaged)
  }
}