package com.opticdev.core.sourcegear

import com.opticdev.common.PackageRef
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.opm.{OpticPackage, PackageManager}
import com.opticdev.parsers.ParserBase

object SGConstructor {

  def fromProjectFile(projectFile: ProjectFile): Unit = {
    val dependencies = projectFile.dependencies.getOrElse(Vector())
    val resolvedTry = PackageManager.collectPackages(dependencies:_*)

    if (resolvedTry.isSuccess) {
      val resolved = resolvedTry.get

    }


  }

}
