package com.useoptic.types

import better.files.File
import com.sksamuel.avro4s.AvroSchema
import com.useoptic.types.capture.Capture
import org.apache.avro.Schema

object AvroMappings {
  val out = File("build/avro-schemas/")

  def main(args: Array[String]): Unit = {
    out.createIfNotExists(asDirectory = true)
    out.children.foreach(_.delete(true))
    // Add to this List
    writeSchema("capture.json", AvroSchema[Capture])
  }

  def writeSchema(fileName: String, schema: Schema) = {
    import better.files._
    import File._
    val file = File(out, fileName)
    file.write(schema.toString)
  }
}
