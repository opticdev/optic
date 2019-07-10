package com.seamless.document
import scala.meta._

object ReadCaseClasses {

  case class CaseClassDef(name: String, args: List[(String, Option[Type])], extendsString: String)


  def fileContents(fileName: String): String = {
    import scala.io.Source
    val s = Source.fromFile(fileName)
    val contents = s.getLines.mkString("\n")
    s.close()
    contents
  }


  def parseCaseClassesExtending(file: String, traitName: String) = {
    val tree: Source = fileContents(file).parse[Source].get
    tree.collect {
      case caseClass: Defn.Class if caseClass.mods.exists(_.toString == "case") &&
        caseClass.templ.inits.head.toString() == traitName => {
        val name = caseClass.name.value
        val args = caseClass.ctor.paramss.head.map(i => (i.name.value, i.decltpe))
        CaseClassDef(name, args, traitName)
      }
    }
  }

}
