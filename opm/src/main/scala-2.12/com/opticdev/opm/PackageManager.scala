package com.opticdev.opm

import com.opticdev.common.PackageRef
import com.opticdev.opm.context.{Leaf, Tree}
import com.opticdev.opm.providers.Provider
import com.opticdev.opm.storage.PackageStorage
import com.opticdev.parsers.ParserRef
import com.vdurmont.semver4j.Semver
import com.vdurmont.semver4j.Semver.SemverType

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Await, Future}
import scala.util.Try
import scala.concurrent.duration._
object PackageManager {

  private var providerStore : Seq[Provider] = Seq()
  def providers = providerStore
  def setProviders(newProviders: Provider*) = providerStore = newProviders

//  def defaultProviders =

  def installPackage(packageRef: PackageRef) : Try[Vector[String]] = {
    installPackages(packageRef)
  }

  def installPackages(packages: PackageRef*) = Try {

    //name -> satisfied
    val flattenedDependencyTree = collection.mutable.Map[PackageRef, Boolean]()
    packages.foreach(i=> flattenedDependencyTree(i) = false)

    val foundPackages = collection.mutable.Buffer[OpticMDPackage]()

    def alreadySatisfies(packageId: String, range: String): Boolean =
      foundPackages.exists(p=> p.packageId == packageId && new Semver(p.version, SemverType.NPM).satisfies(range))

    //when some dependencies are not loaded
    while(!flattenedDependencyTree.forall(_._2)) {
      val packageRefs = flattenedDependencyTree.filter(!_._2).keySet

      val results = resultsForRefs(packageRefs.toSeq:_*)

      if (results.notFound.nonEmpty) {
        throw new Exception("Some packages could not be resolved "+ results.notFound.map(_.full).toVector.sorted.mkString(","))
      } else {
        //mark all queried as satisfied
        packageRefs.foreach(key=> flattenedDependencyTree(key) = true)
      }

      results.found.foreach(foundPackage=> {
        //add to write buffer
        foundPackages += foundPackage
        //add dependencies for next pass
        foundPackage.dependencies.foreach(i=> {
          //if we haven't already resolved this
          if (!alreadySatisfies(i.packageId, i.version)) {
            flattenedDependencyTree(i) = false
          }
        })
      })
    }

    foundPackages.foreach(p=> PackageStorage.writeToStorage(p))
    foundPackages.map(_.packageRef.full).toVector.sorted
  }

  def collectPackages(packages: Seq[PackageRef]) : Try[DependencyTree] = Try {

    var loaded = packages.map(p=> (p, PackageStorage.loadFromStorage(p)))

    val tryInstall = {
      if (loaded.exists(_._2.isFailure)) {
        val failed = loaded.filter(_._2.isFailure).map(_._1)
        val tryInstall = installPackages(failed: _*)
        loaded = packages.map(p=> (p, PackageStorage.loadFromStorage(p)))
        tryInstall
      } else Try(Vector())
    }

    if (tryInstall.isSuccess) {
      if (loaded.exists(_._2.isFailure)) {
        throw new Exception("Could not resolve packages "+ loaded.filter(_._2.isFailure).map(_._1.full).mkString(", ") )
      } else {
        val packagesResolved = loaded.map(_._2.get).toVector

        val leafs = packagesResolved.map(i=>{
          Leaf(i, collectPackages(i.dependencies).get)
        })

        Tree(leafs:_*)
      }
    } else {
      throw tryInstall.failed.get
    }

  }

  //provider query
  def resultsForRefs(packageRefs: PackageRef*) : BatchPackageResult= {
    val lookupResults = providerStore.foldLeft(Seq(): Seq[BatchPackageResult]) {
      case (results, provider)=> {
        if (results.nonEmpty && results.last.foundAll) {

          //no need to query another provider if it'll be overridden
          results
        } else {
          val future = provider.resolvePackages(packageRefs:_*)
          val result = Await.result(future, 7 seconds)
          results :+ result
        }
      }
    }

    import com.opticdev.opm.utils.FlattenBatchResultsImplicits._

    lookupResults.flattenResults
  }

  def collectParsers(parserRefs: ParserRef*) : BatchParserResult = {

    val distinctParserRefs = parserRefs.distinct

    val futures = providers.map(_.resolveParsers(distinctParserRefs:_*))

    val future = Future.sequence(futures)

    val result = Await.result(future, 7 seconds)

    import com.opticdev.opm.utils.FlattenBatchResultsImplicits._

    result.flattenResults

  }

}
