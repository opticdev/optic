package com.useoptic.end_to_end.fixtures

import com.useoptic.diff.ShapeDiffer.ShapeDiffResult
import org.scalatest.{FunSpec, Matchers, WordSpec}
import io.circe._
import io.circe.parser._
import io.circe.syntax._
import io.circe._
import io.circe.generic.semiauto._

import scala.util.Try
import io.circe.syntax._
import better.files._

abstract class SnapShotDriverFixture[InputJson, OutputJson](folderSlug: String, snapshotName: String) extends WordSpec {

  private val md = java.security.MessageDigest.getInstance("SHA-1")

  val snapshotsDir = "domain-snapshots".toFile
  val snapshotDirectory = snapshotsDir / folderSlug
  val snapshotOutputDirectory = snapshotsDir / "outputs"

  snapshotDirectory.createIfNotExists(asDirectory = true)
  snapshotOutputDirectory.createIfNotExists(asDirectory = true)

  setEnv("TESTS_ARE_RUNNING", "TRUE")

  def serializeOutput(output: OutputJson): Json

  def deserializeInput(json: Json): InputJson
  def deserializeOutput(json: Json): OutputJson

  def transform(input: InputJson): OutputJson
  def compare(result: OutputJson, snapshot: OutputJson) : Boolean = result == snapshot

  s"${snapshotName} snapshot tests" should {
    snapshotDirectory.list.foreach { case file =>
      s"${file.nameWithoutExtension}" should {

        var input: Option[InputJson] = None
        var output: Option[OutputJson] = None

        s"input should deserialize properly" in {
          input = Some(deserializeInput(parse(file.contentAsString).right.get))
        }

        s"input yields valid output" in {
          output = Some(transform(input.get))
        }

        s"Matches Snapshot" in {

          val hash = convertBytesToHex(md.digest((file.contentAsString + folderSlug).getBytes))+".json"
          val snapshot = snapshotOutputDirectory / hash
          if (snapshot.exists) {
            val snapshotValue = deserializeOutput(parse(snapshot.contentAsString).right.get)
            assert(compare(output.get, snapshotValue))
          } else {
            println("Creating new snapshot. Don't trust this the first time -- doesn't mean things work" + snapshot)
            snapshot.write(serializeOutput(output.get).noSpaces)
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
