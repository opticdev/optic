package com.opticdev.core.utils

import better.files._
import com.opticdev.core.sourcegear.project.config.ProjectFile
object FileInPath {

  implicit class FileInPath(potentialChild: File) {
    def inPathOf(parent: File) =
      potentialChild.toJava.getAbsolutePath.startsWith(parent.toJava.getAbsolutePath)

    def parentsOf: Seq[File] = {

      var cd = potentialChild
      val parents = scala.collection.mutable.ListBuffer[File]()

      while(cd.parentOption.isDefined) {
        cd = cd.parentOption.get
        parents += cd
      }

      parents.toSeq

    }

    def projectFileOption : Option[ProjectFile] = {
      val baseDirOption = parentsOf.find(i=> {
        i.exists && i.list.exists(_.name == "optic.yml")
      })

      baseDirOption.map(i=> new ProjectFile(i / "optic.yml"))
    }

  }

}
