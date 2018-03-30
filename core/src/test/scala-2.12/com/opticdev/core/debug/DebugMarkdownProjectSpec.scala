package com.opticdev.core.debug

import better.files.File
import com.opticdev.core.Fixture.{AkkaTestFixture, TestBase}
import com.opticdev.opm.TestPackageProviders
import com.opticdev.sdk.descriptions.Lens
import com.opticdev.sdk.markdown.OpticMarkdownInstaller
import org.scalatest.BeforeAndAfterAll
import org.scalatest.concurrent.Eventually
import org.scalatest.time.{Seconds, Span}

import scala.concurrent.duration._
import scala.concurrent.Await

class DebugMarkdownProjectSpec extends AkkaTestFixture("DebugMarkdownProjectSpec") with TestPackageProviders with BeforeAndAfterAll {
  def fixture = DebugMarkdownProject()

  override def beforeAll(): Unit = {
    OpticMarkdownInstaller.getOrInstall
    super.beforeAll()
  }

  lazy val testPackage = File("test-examples/resources/example_markdown/Mongoose.md")

  it("can parse a markdown file to its project graph") {
    val f = fixture
    val result = Await.result(f.graphForFile(testPackage), 10 seconds)
    assert(result.get.nonEmpty)
  }

  it("can will return an SDK Object for context") {
    val f = fixture
    val result = Await.result(f.contextFor(testPackage, Range(1155, 1155)), 10 seconds)
    assert(result.isDefined)
    assert(result.get.isInstanceOf[Lens])
  }

  it ("will not return an SDK object if file is not real") {
    val f = fixture
    val result = Await.result(f.contextFor(File("not/real"), Range(0, 0)), 10 seconds)
    assert(result.isEmpty)
  }

  it ("will not return an SDK object if none is within range") {
    val f = fixture
    val result = Await.result(f.contextFor(testPackage, Range(6, 9)), 10 seconds)
    assert(result.isEmpty)
  }



}
