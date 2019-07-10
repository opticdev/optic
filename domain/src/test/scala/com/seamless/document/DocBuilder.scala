package com.seamless.document

import scala.meta.Type

abstract class DocBuilder(saveToPath: String) {
  private val stringBuilder = new StringBuilder

  def h1(string: String): Unit = stringBuilder.append(s"""\n# ${string}\n""")
  def h2(string: String): Unit = stringBuilder.append(s"""\n## ${string}\n""")
  def h3(string: String): Unit = stringBuilder.append(s"""\n### ${string}\n""")
  def p(string: String): Unit = stringBuilder.append(s"""\n${string}\n""")

  def argsFrom(args: List[(String, Option[Type])]): Unit = {
    val string = args.map(arg => s"""${arg._1}: `${arg._2.get.toString}`""").mkString(", ")
    p(string)
  }

  override def toString: String = stringBuilder.toString()

}
