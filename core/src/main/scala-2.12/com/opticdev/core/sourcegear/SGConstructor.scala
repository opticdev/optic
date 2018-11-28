package com.opticdev.core.sourcegear
import com.opticdev.core.compiler.{Compiler, CompilerOutput}
import com.opticdev.common.{PackageRef, ParserRef, SchemaRef}
import com.opticdev.core.compiler.errors.{ErrorAccumulator, SomePackagesFailedToCompile}
import com.opticdev.core.sourcegear.context.{FlatContext, FlatContextBuilder}
import com.opticdev.core.sourcegear.graph.objects.ObjectNode
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.core.sourcegear.project.config.options.{ConstantObject, DefaultSettings}
import com.opticdev.core.sourcegear.storage.SGConfigStorage
import com.opticdev.opm.{DependencyTree, PackageManager}
import com.opticdev.parsers.{ParserBase, SourceParserManager}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Try}

object SGConstructor {

  def fromProjectFile(projectFile: ProjectFile)(implicit useCache: Boolean = true)  : Future[SGConfig] = Future {
    val cacheTry = loadFromCache(projectFile)
    if (useCache && cacheTry.isSuccess) {
      Future(loadFromCache(projectFile).get)
    } else {

      val dependencies: DependencyTree = dependenciesForProjectFile(projectFile).get

      val parsersRefs = parsersForProjectFile(projectFile).get

      val config = fromDependencies(
        dependencies,
        parsersRefs,
        projectFile.connected_projects,
        projectFile.objects,
        projectFile.defaults
      )

      //save to cache on complete to make next time easier
      if (useCache) {
        config.onComplete(_.map(c => {
          SGConfigStorage.writeToStorage(c, projectFile.hash)
        }))
      }

      config
    }
  }.flatten

  def loadFromCache(projectFile: ProjectFile) = SGConfigStorage.loadFromStorage(projectFile.hash)

  def fromDependencies(dependencies: DependencyTree, parserRefs: Set[ParserRef], connectedProjects: Set[String], constantObjects: Vector[ObjectNode], parserDefaults: Map[SchemaRef, DefaultSettings])  : Future[SGConfig] = Future {

    val compiled = compileDependencyTree(dependencies, parserDefaults).get

    implicit val schemas = dependencies.flattenSchemas
    val schemaSetColdStorage = schemas.map(_.toColdStorage)
    val transformationSet = dependencies.flattenTransformations
    implicit val compiledLenses = compiled.flatMap(_.gears).toSet

    val flatContext = FlatContextBuilder.fromDependencyTree(dependencies)

    SGConfig(dependencies.hash, flatContext, parserRefs, compiledLenses, schemaSetColdStorage, transformationSet, connectedProjects, constantObjects)
  }

  def dependenciesForProjectFile(projectFile: ProjectFile): Try[DependencyTree] =
    projectFile.dependencies.flatMap(PackageManager.collectPackages)

  def parsersForProjectFile(projectFile: ProjectFile) : Try[Set[ParserRef]] = Try {
    projectFile.parsers.toSet
  }

  def compileDependencyTree(implicit dependencyTree: DependencyTree, parserDefaults: Map[SchemaRef, DefaultSettings] = Map()): Try[Seq[CompilerOutput]] = Try {

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
