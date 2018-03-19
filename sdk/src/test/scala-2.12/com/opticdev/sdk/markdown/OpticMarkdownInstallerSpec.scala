package com.opticdev.sdk.markdown

import akka.dispatch.Futures
import better.files.File
import com.opticdev.common.storage.DataDirectory
import com.opticdev.sdk.BuildInfo
import org.scalatest.concurrent.Eventually
import org.scalatest.time.{Seconds, Span}
import org.scalatest.{BeforeAndAfterEach, FunSpec, PrivateMethodTester}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Await, Future}
import scala.concurrent.duration._
import scala.util.Try

/*
This suite is long running. It's really important to cover all these cases and make sure its threadsafe.
 */

class OpticMarkdownInstallerSpec extends FunSpec with PrivateMethodTester with BeforeAndAfterEach with Eventually {

  override protected def beforeEach(): Unit = {
    DataDirectory.init
    DataDirectory.bin.list.foreach(_.delete(true))
  }

  def download(tar: String, sum: String) = {
    val download = PrivateMethod[Try[File]]('download)
    OpticMarkdownInstaller invokePrivate download(tar, sum)
  }

  describe("download") {

    it("works with valid url & checksum") {
      val result = download(
        BuildInfo.opticMDTar,
        BuildInfo.opticMDTarSum
      )
      assert(result.isSuccess)
    }

    it("fails if url is invalid") {
      val result = download(
        "NOT REAL",
        BuildInfo.opticMDTarSum
      )
      assert(result.isFailure)
    }

    it("fails if checksum is wrong") {
      val result = download(
        BuildInfo.opticMDTar,
        "FAKE_WRONG"
      )
      assert(result.isFailure)
    }

  }

  def unzip(file: File) = {
    val download = PrivateMethod[Try[File]]('unzip)
    OpticMarkdownInstaller invokePrivate download(file)
  }

  describe("unzip") {

    it("works with valid file piped in") {
      val downloadResult = download(
        BuildInfo.opticMDTar,
        BuildInfo.opticMDTarSum
      )

      val unzipResult = downloadResult.map(i=> unzip(i)).flatten

      assert(DataDirectory.bin.list.size == 1)
      assert(unzipResult.get == (DataDirectory.bin / "optic-markdown"))

    }

  }

  def npmInstall(file: File) = {
    val download = PrivateMethod[Try[File]]('npmInstall)
    OpticMarkdownInstaller invokePrivate download(file)
  }

  it("npm install works") {
    val unzippedDirectory = download(
      BuildInfo.opticMDTar,
      BuildInfo.opticMDTarSum
    ).map(unzip).flatten

    val result = npmInstall(unzippedDirectory.get)

    assert(result.isSuccess)

  }

  describe("Get or install") {

    it("will install instance when none exists") {
      assert(OpticMarkdownInstaller.getOrInstall.isSuccess)
    }

    it("will get the instance that is already installed next time") {

      assert(OpticMarkdownInstaller.getOrInstall.isSuccess)

      eventually (timeout(Span(5, Seconds))) {
        assert(OpticMarkdownInstaller.getOrInstall.isSuccess)
      }

    }

    it("is thread safe") {

      val a = Future(OpticMarkdownInstaller.getOrInstall.isSuccess)
      val b = Future(OpticMarkdownInstaller.getOrInstall.isSuccess)
      val c = Future(OpticMarkdownInstaller.getOrInstall.isSuccess)


      val result = Await.result(Future.sequence(Seq(a,b,c)), 1 minute)
      assert(result.forall(_ == true))
    }


  }

}
