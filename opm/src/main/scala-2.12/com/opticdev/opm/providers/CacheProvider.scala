package com.opticdev.opm.providers
import com.opticdev.common.PackageRef
import com.opticdev.opm
import com.opticdev.opm.BatchPackageResult
import com.opticdev.opm.packages.OpticPackage
import com.opticdev.opm.storage.PackageStorage
import com.opticdev.parsers.{ParserBase, ParserRef}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

class CacheProvider extends Provider {

  override def resolvePackages(packageRefs: PackageRef*)(implicit projectKnowledgeSearchPaths: ProjectKnowledgeSearchPaths, excludeFromCache: Seq[PackageRef]): Future[opm.BatchPackageResult] = Future {

    val collection = packageRefs.map(pr => {
      if (excludeFromCache.contains(pr)) throw new Exception("'"+pr.full+"' can not be loaded with this provider")
      (pr, PackageStorage.loadFromStorage(pr))
    })

    val found = collection.collect {case (pr, tryLoad) if tryLoad.isSuccess => tryLoad.get }.toSet
    val notFound = collection.collect {case (pr, tryLoad) if tryLoad.isFailure => pr}.toSet

    BatchPackageResult(found, notFound)

  }

  override def resolveParsers(parsers: ParserRef*): Future[opm.BatchParserResult] = ???

  override def isCache: Boolean = true

}
