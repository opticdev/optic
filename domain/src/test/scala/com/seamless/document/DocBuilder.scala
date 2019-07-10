package com.seamless.document

import scala.meta.Type
import com.seamless.document.ReadCaseClasses.fileContents
import com.seamless.document.domain_docs.{Commands, Events}

abstract class DocBuilder {
  private val stringBuilder = new StringBuilder

  def h1(string: String): Unit = stringBuilder.append(s"""\n# ${string}\n""")
  def h2(string: String): Unit = stringBuilder.append(s"""\n## ${string}\n""")
  def h3(string: String): Unit = stringBuilder.append(s"""\n### ${string}\n""")
  def h4(string: String): Unit = stringBuilder.append(s"""\n#### ${string}\n""")
  def p(string: String): Unit = stringBuilder.append(s"""\n${string}\n""")

  def argsFrom(args: List[(String, Option[Type])]): Unit = {
    val string = args.map(arg => s"""${arg._1}: `${arg._2.get.toString}`""").mkString(", ")
    p(string)
  }

  override def toString: String = stringBuilder.toString()

}


object DocBuilder {
  def main(args: Array[String]): Unit = {
    val contents = fileContents("src/test/scala/com/seamless/document/domain_docs/spec.md")
    val events = new Events().toString
    val commands = new Commands().toString

    val spec =
    contents.replace("{ALL_EVENTS}", events)
            .replace("{ALL_COMMANDS}", commands)


    import java.io._
    val pw = new PrintWriter(new File("spec.md" ))
    pw.write(spec)
    pw.close
  }
}