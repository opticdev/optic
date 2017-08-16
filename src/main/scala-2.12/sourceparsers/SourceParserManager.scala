package sourceparsers


import java.io.File
import java.net.URLClassLoader
import java.security.MessageDigest

import cognitro.parsers.GraphUtils._
import cognitro.parsers.{IdentifierNodeDesc, ParserBase}
import io.FileCrypto

import scalax.collection.edge.Implicits._
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

object SourceParserManager {


  private var parsers : Set[ParserBase] = Set()
  //generated one time
  private var parsersNameAndVersions : Map[String, Vector[String]] = null

  private lazy val sha = MessageDigest.getInstance("SHA")

  def hasParserFor(lang: String) : Boolean = getInstalledParsers().find(_.languageName == lang).isDefined

  private def enableParser(instance: ParserBase) = {
    parsers = parsers + instance
    generateSignature()
  }

  private def generateSignature(): Unit = {
    parsersNameAndVersions = parsers.toVector.sortBy(_.languageName).map(i=> {
      i.languageName -> i.fileExtensions
    }).toMap
  }

  def parserByLanguageName(lang: String): Option[ParserBase] = {
    parsers.find(_.languageName == lang)
  }

  private def disableParser(instance: ParserBase) = {
    parsers = parsers.filterNot(_==instance)
    generateSignature()
  }


  def clearParsers = parsers = Set()

  def getInstalledParsers() : Set[ParserBase] = parsers
  def getParserSignatures() = parsersNameAndVersions

  def selectParserForFileName(name: String): Option[ParserBase] = {
    //@note does not support multiple things having same patterns
    parsers.find(i=> i.fileExtensions.map(name.endsWith(_)).contains(true))
  }

  def programNodeTypeForLanguage(language: String) : Option[NodeType] = {
    val parser = parserByLanguageName(language)
    if (parser.isDefined) {
      Option(parser.get.programNodeType)
    } else {
      None
    }
  }

  def IdentifierNodeTypeForLanguage(language: String) : Option[IdentifierNodeDesc] = {
    val parser = parserByLanguageName(language)
    if (parser.isDefined) {
      Option(parser.get.identifierNodeDesc)
    } else {
      None
    }
  }

  def parseString(contents: String, language: String, versionOverride: Option[String] = None, fileHash: String = "SPACE"): (Graph[BaseNode, LkDiEdge], AstPrimitiveNode) = {
    val parser = parserByLanguageName(language)
    if (parser.isDefined) {
      val parsedResult = parser.get.parseString(versionOverride, contents)
      val emptyGraph = GraphBuilder.emptyGraph

      val rootNode = GraphBuilder.astGraphNode(parsedResult._1, language)(emptyGraph)
      val fileNode = InMemoryFileNode(contents, FileCrypto.hashString(contents), language, parsedResult._2)

      val mainEdge: LkDiEdge[BaseNode] = (fileNode ~+#> rootNode) (Produces())

      emptyGraph.add(mainEdge)

      (GraphBuilder.build(emptyGraph, parsedResult._1.asInstanceOf[ASTNode], language, fileHash = fileHash), rootNode)
    } else null
  }

  def parseFile(file: File, languageOverride: Option[String] = None, versionOverride: Option[String] = None): Option[ParsedFile] = {

    val parser = {
      if (languageOverride.isDefined) {
        parserByLanguageName(languageOverride.get)
      } else {
        selectParserForFileName(file.getName)
      }
    }

    if (parser.isDefined) {

      if (file.canRead) {
        val lines = scala.io.Source.fromFile(file.getPath).mkString
        val result = Option(
          ParsedFile(
            file.getAbsolutePath,
            FileCrypto.hashFile(file.getAbsolutePath),
            parser.get.languageName,
            //@todo fix this typing issue
            parser.get.parseString(versionOverride, lines).asInstanceOf[(ASTNode, String)]
            /*AstExtensionManager.parserExtensionSet*/
          )
        )

        result
      } else {
        println("No file found at path")
        None
      }

    } else {
      println("No parser found")
      None
    }

  }

  def installParser(pathToParser: String) : ParserResult = {
    val file = new File(pathToParser)

    if (file.exists() && file.canRead) {
      try {
        val instance = loadJar(file)
        enableParser(instance)
        Success(instance.languageName)
      } catch {
        case e: Exception => {
          println(e)
          Failure("Invalid Parser .jar")
        }
      }
    } else {
      Failure("Unable to install parser. File not found at " + pathToParser)
    }

  }

  @throws(classOf[Exception])
  private def loadJar(parserJar: File): ParserBase = {
    val child = new URLClassLoader(Array(parserJar.toURL), this.getClass().getClassLoader())
    val classToLoad = child.loadClass("javascript.Parser")
    val instance = classToLoad.newInstance().asInstanceOf[ParserBase]
    instance
  }


}
