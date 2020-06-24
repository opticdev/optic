package com.useoptic.end_to_end.snapshot_task

import better.files._
import io.circe._
import io.circe.parser._
import org.scalatest.{BeforeAndAfterAll, WordSpec}

import scala.util.Try

abstract class SnapShotDriverFixture[InputJson, OutputJson](folderSlug: String, snapshotName: String) extends WordSpec with BeforeAndAfterAll {

  private val md = java.security.MessageDigest.getInstance("SHA-1")

  val snapshotsDir = "domain-snapshots".toFile
  val snapshotDirectory = snapshotsDir / folderSlug
  val snapshotOutputDirectory = snapshotsDir / folderSlug / "outputs"

  snapshotDirectory.createIfNotExists(asDirectory = true)
  snapshotOutputDirectory.createIfNotExists(asDirectory = true)

  def when(staticName: String, block: () => InputJson) = {
    val inputFile = snapshotDirectory / (staticName + ".managed.json")
    inputFile.createIfNotExists(asDirectory = false)
    inputFile.writeText(serializeInput(block()).spaces2)
  }

  private val knownIssues = scala.collection.mutable.ListBuffer[String]()

  def when_KNOWN_ISSUE(staticName: String, block: () => InputJson) = {
    knownIssues.append(staticName)
    when(staticName, block)
  }


  private var only: Option[String] = None

  def whenOnly(staticName: String, block: () => InputJson) = {
    when(staticName, block)
    only = Some(staticName)
  }

  setEnv("TESTS_ARE_RUNNING", "TRUE")

  def serializeOutput(output: OutputJson): Json

  def deserializeInput(json: Json): InputJson
  def serializeInput(input: InputJson): Json
  def deserializeOutput(json: Json): OutputJson

  def transform(input: InputJson): OutputJson
  def compare(result: OutputJson, snapshot: OutputJson) : Boolean = result == snapshot

  def summary(input: InputJson, result: OutputJson): String = ""

  def runSuite = {
    s"${snapshotName} snapshot tests" should {
      println("Snapshot Results "+ snapshotName)
      snapshotDirectory.list.filter(i =>
        i.isRegularFile && (only.isEmpty || only.contains(i.nameWithoutExtension)))
        .foreach { case file =>

        s"${file.nameWithoutExtension}" should {
          var input: Option[InputJson] = None
          var output: Try[OutputJson] = null
          s"deserialize the input" in {
            input = Some(deserializeInput(parse(file.contentAsString).right.get))
          }

          s"perform task" in {
            output = Try(transform(input.get))
            assert(output.isSuccess, if (output.isFailure) "Failed to transform: "+ output.failed.get.getMessage.toString else "")
          }

          s"match snapshot" in {
            if (output.isSuccess) {
              if (!knownIssues.contains(file.nameWithoutExtension)) {
                println("THIS IS A KNOWN ISSUE:")
              }
              val dir = snapshotOutputDirectory
              dir.createIfNotExists(asDirectory = true)
              val snapshot = dir / file.name
              if (snapshot.exists) {
                val snapshotValue = deserializeOutput(parse(snapshot.contentAsString).right.get)
                assert(compare(output.get, snapshotValue), s"(${dir.name} / ${file.name}) snapshot does not match")
                println(s" - PASSED: ${file.nameWithoutExtension}")
                val s = summary(input.get, output.get)
                if (s.nonEmpty) {
                  println(s)
                }
              } else {
                val pendingDirectory = dir / "pending"
                pendingDirectory.createIfNotExists(asDirectory = true)
                val pendingSnapshot = pendingDirectory / file.name
                println(s" - PENDING: ${file.nameWithoutExtension}. To approve move it out of the pending folder")
                val s = summary(input.get, output.get)
                if (s.nonEmpty) {
                  println(s)
                }
                pendingSnapshot.write(serializeOutput(output.get).spaces2)
                assert(false, "Pending Snapshot. Must be approved before test will pass")
              }
            }
          }
        }
      }

    }
  }


  private def setEnv(key: String, value: String) = {
    val field = System.getenv().getClass.getDeclaredField("m")
    field.setAccessible(true)
    val map = field.get(System.getenv()).asInstanceOf[java.util.Map[java.lang.String, java.lang.String]]
    map.put(key, value)
  }


  private def convertBytesToHex(bytes: Seq[Byte]): String = {
    val sb = new StringBuilder
    for (b <- bytes) {
      sb.append(String.format("%02x", Byte.box(b)))
    }
    sb.toString
  }
}
