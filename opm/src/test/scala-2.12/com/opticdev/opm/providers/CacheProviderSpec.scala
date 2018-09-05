package com.opticdev.opm.providers

import com.opticdev.common.PackageRef
import com.opticdev.opm.TestPackageProviders
import com.opticdev.opm.storage.PackageStorage
import org.scalatest.{BeforeAndAfterAll, FunSpec}

import scala.concurrent.duration._
import scala.concurrent.Await

class CacheProviderSpec extends FunSpec with BeforeAndAfterAll with TestPackageProviders {

  implicit val excludeFromCache : Seq[PackageRef] = Seq()

  override def beforeAll(): Unit = {
    PackageStorage.writeToStorage(t.a)
    PackageStorage.writeToStorage(t.b)
    PackageStorage.writeToStorage(t.c)
  }

  val provider = new CacheProvider

  it("can find packages saved to cache refs") {
    val future = provider.resolvePackages(t.a.packageRef)
    val result = Await.result(future, 20 seconds)
    assert(result.foundAll)
  }


}
