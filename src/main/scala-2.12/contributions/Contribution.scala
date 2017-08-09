package cognitro.core.contributions

import graph.FileNodeWrapper
import io.StringUtils

sealed trait Contribution {
  val fileNode: FileNodeWrapper
  val range: (Int, Int)

  override def toString: String = fileNode.node.filePath + " "+ range
  def applyTo(contents: String) : String
}

case class ReplaceString(override val fileNode: FileNodeWrapper, override val range: (Int, Int), newString: String) extends Contribution {

  override def toString: String = "Replace String "+ super.toString+" with "+ newString

  override def applyTo(contents: String): String = StringUtils.replaceRange(contents, range, newString)

}


