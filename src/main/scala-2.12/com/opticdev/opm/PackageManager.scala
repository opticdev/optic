package com.opticdev.opm
import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
object PackageManager {

  private var providerStore : Seq[Provider] = Seq()
  def providers = providerStore
  def setProviders(newProviders: Provider*) = providerStore = newProviders

  def installPackage(packageRef: PackageRef): Option[OpticPackage] = {
    val firstResultOption = firstResultForRef(packageRef)

    if (firstResultOption.isDefined) {
      PackageStorage.writeToStorage(firstResultOption.get)
    }

    firstResultOption
  }




  //provider queries
  def firstResultForRef(packageRef: PackageRef): Option[OpticPackage] = {
    providerStore.foldLeft(None:Option[OpticPackage]) {
      case (option, provider)=> {
        if (option.isDefined) {
          option
        } else {
          val future = provider.resolvePackage(packageRef)
          val result = Await.result(future, 5 seconds)
          if (result.isDefined) {
            result
          } else {
            None
          }
        }
      }
    }
  }

  def resultsForRefs(packageRefs: PackageRef*) : BatchPackageResult= {
    val lookupResults = providerStore.foldLeft(Seq(BatchPackageResult())) {
      case (results, provider)=> {
        if (!results.isEmpty && results.last.foundAll) {
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
