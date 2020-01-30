package com.useoptic.utilities

abstract class DocBuilder {

  private val stringBuilder = new StringBuilder

  def h1(string: String): Unit = stringBuilder.append(s"""\n# ${string}\n""")
  def h2(string: String): Unit = stringBuilder.append(s"""\n## ${string}\n""")
  def h3(string: String): Unit = stringBuilder.append(s"""\n### ${string}\n""")
  def h4(string: String): Unit = stringBuilder.append(s"""\n#### ${string}\n""")
  def h5(string: String): Unit = stringBuilder.append(s"""\n##### ${string}\n""")
  def p(string: String): Unit = stringBuilder.append(s"""\n${string}\n""")

  def li(string: String): Unit = stringBuilder.append(s"""- ${string}\n""")
  def code(string: String): String = s"""`${string}`"""

  override def toString: String = stringBuilder.toString()

}
