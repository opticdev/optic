package com.opticdev.core.sourcegear.annotations

object AnnotationRenderer {
  def render(inlineCommentPrefix: String, annotations: Vector[ObjectAnnotation]) : String = {
    val inner = annotations.map(_.asString).mkString(",")
    //2 spaces of padding
    s"  $inlineCommentPrefix$inner"
  }

  def renderToFirstLine(inlineCommentPrefix: String, annotations: Vector[ObjectAnnotation], contents: String) : String = {
    val result = render(inlineCommentPrefix, annotations)

    val s = contents
    val lines = s.lines.toVector
    val firstNonEmptyLine = lines.indexWhere(_.trim.nonEmpty)

    if (firstNonEmptyLine == -1) {
      result
    } else {
      val newFirstLine = lines.lift(firstNonEmptyLine).getOrElse("")+result
      lines.patch(firstNonEmptyLine, Vector(newFirstLine), 1).mkString("\n")
    }
  }

}
