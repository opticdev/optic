package com.seamless.document
import scala.meta._

object ReadCaseClasses {

  def parseCaseClassesExtending(code: String, traitName: String): Unit = {
    val tree = code.parse[Source].get
    null
  }


  def fileContents(fileName: String): String = {
    import scala.io.Source
    val s = Source.fromFile(fileName)
    val contents = s.getLines.mkString
    s.close()
    contents
  }


  def main(args: Array[String]): Unit = {
    val file = fileContents("src/main/scala/com/seamless/contexts/rfc/Events.scala")

  }

}
