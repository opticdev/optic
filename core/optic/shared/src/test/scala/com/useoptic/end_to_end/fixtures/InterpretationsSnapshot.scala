package com.useoptic.end_to_end.fixtures

import com.useoptic.diff.ShapeDiffer.ShapeDiffResult
import io.circe.syntax._
import better.files._
import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.diff.DiffInterpretation
import com.useoptic.serialization.CommandSerialization
import io.circe._
import io.circe.parser._
import io.circe.syntax._
import io.circe.parser.decode
import io.circe._
import io.circe.generic.auto._
import io.circe.syntax._

import scala.util.Try



object OpticSnapshotHelper {

  val snapshotsDir = "domain-snapshots".toFile
  snapshotsDir.createIfNotExists(asDirectory = true)

  def checkD(testName: String, name2: String, diffVector: Vector[ShapeDiffResult]): Boolean = {
    val jsonDiff = diffVector.asJson
    val snapshot = snapshotsDir / slugify(s"${testName}.${name2}.json")
    if (snapshot.exists) {
      val couldParse = Try {
        decode[Vector[ShapeDiffResult]](snapshot.contentAsString)
      }

      if (couldParse.isSuccess) {
        couldParse.get.right.get == diffVector
      } else {
        println(s"Soft error for snapshot. Could not deserialize. You probably changed the structure of something ${snapshot}")
        false
      }

    } else {
      println("Creating new snapshot. Don't trust this the first time -- doesn't mean things work"+ snapshot)
      snapshot.write(jsonDiff.noSpaces)
      true
    }
  }

  def checkI(testName: String, name2: String, interpretationsVector: Vector[DiffInterpretation]): Boolean = {
    val a = interpretationsVector.map(i => CommandSerialization.toJson(i.commands).noSpaces)
    val jsonDiff = a.asJson
    val snapshot = snapshotsDir / slugify(s"${testName}.${name2}.json")


    if (snapshot.exists) {
      a.asJson.noSpaces == snapshot.contentAsString
    } else {
      println("Creating new snapshot. Don't trust this the first time -- doesn't mean things work"+ snapshot)
      snapshot.write(jsonDiff.noSpaces)
      true
    }
  }

  def slugify(str: String): String = {
    import java.text.Normalizer
    //have to hash. file names too long :(
    md5HashString(Normalizer.normalize(str, Normalizer.Form.NFD).replaceAll("[^\\w ]", "").replace(" ", "-").toLowerCase)
  }

  def md5HashString(s: String): String = {
    import java.security.MessageDigest
    import java.math.BigInteger
    val md = MessageDigest.getInstance("MD5")
    val digest = md.digest(s.getBytes)
    val bigInt = new BigInteger(1,digest)
    val hashedString = bigInt.toString(16)
    hashedString
  }

}
