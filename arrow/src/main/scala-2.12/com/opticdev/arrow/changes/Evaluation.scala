package com.opticdev.arrow.changes

import better.files.File
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.project.OpticProject

object Evaluation {
  def forChangeGroup(changeGroup: ChangeGroup, sourcegear: SourceGear) = {

    val results = changeGroup.changes.map {
      case im: InsertModel => {
        val gearOption = sourcegear.findGear(im.gearId.get)
        if (gearOption.isEmpty) throw new Exception("Gear not found for id. "+ im.gearId.get)

        val gear = gearOption.get
        val generatedCode = gear.generater.generate(im.value)(sourcegear)

        println(generatedCode)

        null
      }
    }


  }
}



trait ChangeResult {
  def isSuccess : Boolean
  def isFailure : Boolean = !isSuccess
  def errors : Seq[Throwable] = Seq.empty
}

case class FileChanged(isSuccess: Boolean, file: File, newContents: String) extends ChangeResult
