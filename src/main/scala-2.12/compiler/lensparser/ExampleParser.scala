package compiler.lensparser

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, BaseNode, NodeType}
import sourceparsers.SourceParserManager

import scalax.collection.mutable.Graph
import scalax.collection.edge.LkDiEdge
//@todo remove this from the final optic

object ExampleParser {

  private val blockCommentRegEx = "/\\*(?:.|[\\n\\r])*?\\*/".r

  def findMatches(contents: String): Map[String, ExampleBlock] = {
    val matches = blockCommentRegEx.findAllMatchIn(contents)

    if (matches.nonEmpty) {
      matches.toVector
        .map(i=> toExampleBlock(i.toString()))
          .filterNot(_.isEmpty)
            .map(i=> {
              val example = i.get
              (example.description.name, example)
            }).toMap
    } else Map()
  }

  val nameRegEx = "\\b[a-zA-Z ]*\\b".r
  val valueRegEx = "\\b[a-zA-Z0-9]*\\b".r
  val langFlagRegEx = "-lang[ \\t]*=[ \\t]*[a-zA-Z0-9]*".r
  val versionFlagRegEx = "-version[ \\t]*=[ \\t]*[a-zA-Z0-9]*".r

  def toExampleBlock(blockContents: String) : Option[ExampleBlock] = {

    val lines = blockContents.lines.toVector

    val desc : Option[ExampleBlockDescription] = {
      val firstLine = lines.head

      val name = nameRegEx.findFirstIn(firstLine)
      val lang = langFlagRegEx.findFirstIn(firstLine)
      val version = versionFlagRegEx.findFirstIn(firstLine)

      if (name.isDefined && lang.isDefined && version.isDefined) {

        val langValue = {
          val value = lang.get.split("=").last
          valueRegEx.findFirstIn(value).get
        }

        val versionValue = {
          val value = version.get.split("=").last
          valueRegEx.findFirstIn(value).get
        }

        Option(ExampleBlockDescription(name.get, langValue, versionValue))

      } else None
    }

    if (desc.isDefined && lines.size >= 3) {
      val bodyContents = lines.slice(1, lines.size-1).mkString("\n")
      Option(ExampleBlock(desc.get, bodyContents))
    } else None

  }


}

case class ExampleBlockDescription(
            name: String,
            language: String,
            version: String)

case class ExampleBlock(
             description: ExampleBlockDescription,
             contents: String) {

  if (!SourceParserManager.hasParserFor(description.language)) {
    throw new Exception("No parser found for language "+description.language+" version "+description.version)
  }

  private val parsed = SourceParserManager.parseString(contents, description.language)
  val graph : Graph[BaseNode, LkDiEdge] = parsed._1
  val rootNode : AstPrimitiveNode = parsed._2

}