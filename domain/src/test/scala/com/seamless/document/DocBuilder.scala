package com.seamless.document

abstract class DocBuilder(saveToPath: String) {
  private val stringBuilder = new StringBuilder

  def h1(string: String): Unit = stringBuilder.append(s"""\n# ${string}\n""")
  def h2(string: String): Unit = stringBuilder.append(s"""\n## ${string}\n""")
  def h3(string: String): Unit = stringBuilder.append(s"""\n### ${string}\n""")
  def p(string: String): Unit = stringBuilder.append(s"""\n${string}\n""")

  override def toString: String = stringBuilder.toString()

}
