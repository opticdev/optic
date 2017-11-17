package com.opticdev.opm

import java.net.URL

import com.opticdev.opm.OpticRegistryProvider
import org.scalatest.{FlatSpec, FunSpec}

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration


class OpticRegistryProviderSpec extends FunSpec {

  describe("Optic Registry Provider") {

//    val opticRegistryProvider = new OpticRegistryProvider() {
//      //override the real URL to our dev environment
//      override val baseUrl = new URL("http://localhost:3000/")
//    }
//
//    it("can download a package") {
//      val future = opticRegistryProvider.resolvePackage(PackageRef("optic:rest", "0.1.1"))
//      val result = Await.ready(future, Duration.Inf).value
//      println(result)
//    }
//

  }


}
