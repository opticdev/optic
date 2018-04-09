package com.opticdev.core.sourcegear
import com.opticdev.core.compiler.{Compiler, CompilerOutput}
import com.opticdev.common.PackageRef
import com.opticdev.core.compiler.errors.{ErrorAccumulator, SomePackagesFailedToCompile}
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.opm.providers.ProjectKnowledgeSearchPaths
import com.opticdev.opm.{DependencyTree, PackageManager}
import com.opticdev.parsers.{ParserBase, ParserRef}
import com.opticdev.sdk.descriptions.Lens

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Try}

object SGConstructor {

  def fromProjectFile(projectFile: ProjectFile)  : Future[SGConfig] = Future {

    implicit val projectKnowledgeSearchPaths = projectFile.projectKnowledgeSearchPaths

    val dependencies: DependencyTree = dependenciesForProjectFile(projectFile).get

    val parsersRefs = parsersForProjectFile(projectFile).get

    fromDependencies(dependencies, parsersRefs)
  }.flatten

  def fromDependencies(dependencies: DependencyTree, parserRefs: Set[ParserRef])(implicit projectKnowledgeSearchPaths: ProjectKnowledgeSearchPaths)  : Future[SGConfig] = Future {

    val compiled = compileDependencyTree(dependencies).get

    val schemaSet = dependencies.flattenSchemas.map(_.toColdStorage)
    val transformationSet = dependencies.flattenTransformations
    val gears = compiled.flatMap(_.gears).toSet

    SGConfig(dependencies.hash, parserRefs, gears, schemaSet, transformationSet)
  }

  def dependenciesForProjectFile(projectFile: ProjectFile): Try[DependencyTree] = {

    implicit val projectKnowledgeSearchPaths = projectFile.projectKnowledgeSearchPaths

    val dependencies: Seq[PackageRef] = projectFile.dependencies.getOrElse(Vector())
    PackageManager.collectPackages(dependencies)
  }

  def parsersForProjectFile(projectFile: ProjectFile) : Try[Set[ParserRef]] = Try {
    projectFile.interface.get.parsers.value
      .map(p=> ParserRef.fromString(p.value).get)
      .toSet
  }

  def compileDependencyTree(dT: DependencyTree): Try[Seq[CompilerOutput]] = Try {

    implicit val dependencyTree = dT

    val compiledPackages = dependencyTree.flatten.map(p=> {
      val compiler = Compiler.setup(p)
      compiler.execute
    }).toSeq

    if (compiledPackages.forall(_.isSuccess)) {
      compiledPackages
    } else {
      val failedPackages = compiledPackages.filter(_.isFailure).map(i=> (i.opticPackage, i.errors))
        .toMap

      println("Compile Errors:")
      failedPackages.values.flatMap(_.values).foreach(_.printAll)

      throw new SomePackagesFailedToCompile(failedPackages)
    }
  }

}
