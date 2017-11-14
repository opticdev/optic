package com.opticdev.opm
import com.vdurmont.semver4j.Semver
import com.vdurmont.semver4j.Semver.SemverType

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.util.{Failure, Success, Try}
object PackageManager {

  private var providerStore : Seq[Provider] = Seq()
  def providers = providerStore
  def setProviders(newProviders: Provider*) = providerStore = newProviders

  def installPackage(packageRef: PackageRef): Try[Vector[String]] = {
    installPackages(packageRef)
  }

  def installPackages(packages: PackageRef*) = Try {

    //name -> satisfied
    val flattenedDependencyTree = collection.mutable.Map[PackageRef, Boolean]()
    packages.foreach(i=> flattenedDependencyTree(i) = false)

    val foundPackages = collection.mutable.Buffer[OpticPackage]()

    def alreadySatisfies(packageId: String, range: String): Boolean =
      foundPackages.exists(p=> p.packageId == packageId && new Semver(p.version, SemverType.NPM).satisfies(range))

    //when some dependencies are not loaded
    while(!flattenedDependencyTree.forall(_._2)) {
      val packageRefs = flattenedDependencyTree.filter(!_._2).keySet

      val results = resultsForRefs(packageRefs.toSeq:_*)

      if (results.notFound.nonEmpty) {
        throw new Error("Some packages could not be resolved "+ results.notFound.map(_.full).toVector.sorted.mkString(","))
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


}
