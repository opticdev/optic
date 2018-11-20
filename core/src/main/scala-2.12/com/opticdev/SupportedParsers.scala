package com.opticdev

import java.io.FileNotFoundException
import java.nio.ByteBuffer

import util.{Failure, Try}
import better.files.File
import boopickle.Default.{Pickle, Unpickle}
import com.opticdev.common.storage.DataDirectory
import com.opticdev.common.{PackageRef, ParserRef}
import com.opticdev.opm.packages.{OpticMDPackage, OpticPackage, ProgrammaticOpticPackage}
import com.opticdev.parsers.{ParserBase, SourceParserManager, es7}
import com.opticdev.sdk.descriptions.transformation.Transformation
import com.opticdev.sdk.skills_sdk.lens.OMLens
import com.opticdev.sdk.skills_sdk.schema.OMSchema
import play.api.libs.json.JsObject
import com.opticdev.core.compiler.{Compiler, LensCompilerOutput}
import com.opticdev.core.sourcegear.{CompiledLens, SGConfig}
import com.opticdev.opm.context.{Leaf, Tree}

object SupportedParsers {

  lazy val parsers = Seq(
    new es7.OpticParser,
  )

  def init(withSkills: Boolean = true) = {
    //enable parser
    parsers.foreach(parser => {
      SourceParserManager.enableParser(parser)
      if (withSkills) {
        val skillCompile = initIncludedSkills(parser)
        if (skillCompile.isFailure) {
          println(Console.RED+ "Failed to compile language skills:" + skillCompile.failed.get.getMessage()+ Console.RESET)
        }
      }
    })

  }

  def getSkills(parser: ParserBase) = initIncludedSkills(parser, true, false).getOrElse(ParserSkillsColdStorage(parser.parserRef, Set(), Set()))

  def initIncludedSkills(parser: ParserBase, useCache: Boolean = true, saveOnComplete: Boolean = true): Try[ParserSkillsColdStorage] = Try {

    if (useCache) {
      val cacheLookup = ParserSkillsColdStorage.loadFromDisk(parser.parserRef)
      if (cacheLookup.isSuccess) {
        return cacheLookup
      }
    }

    println(s"Building ${parser.languageName} language skills")

    val abstractions = parser.defaultSDKItems.abstractions.map(_.toInternal(parser))
    val generators = parser.defaultSDKItems.generators.map(_.toInternal(parser))
    val pr = parser.defaultSDKItems.packageRef(parser)

    val opticPackage = new ProgrammaticOpticPackage {
      override val name: String = pr.name
      override val author: String = pr.namespace
      override val version: String = pr.version
      override val schemas: Vector[OMSchema] = Vector(abstractions:_*)
      override val lenses: Vector[OMLens] = Vector(generators:_*)
      override val transformations: Vector[Transformation] = Vector()
      override val dependencies: Vector[PackageRef] = Vector()
      override def resolved(map: Map[PackageRef, PackageRef]): OpticPackage = this
    }

    val result = Compiler.setup(opticPackage)(false, Tree(Leaf(opticPackage, Tree())), Map()).execute
    val skills = ParserSkillsColdStorage(parser.parserRef, result.gears.map(_.asInstanceOf[CompiledLens]), result.schemas)

    if (saveOnComplete) {
      ParserSkillsColdStorage.saveToDisk(skills)
    }

    skills
  }

  def allParserRefs = parsers.map(_.parserRef)

}

case class ParserSkillsColdStorage(parserRef: ParserRef, generators: Set[CompiledLens], abstractions: Set[OMSchema])

object ParserSkillsColdStorage {
  import com.opticdev.core.sourcegear.serialization.PickleImplicits.parserSkillsColdStoragePickler

  def loadFromDisk(parserRef: ParserRef) = {
    val file = DataDirectory.parserSkills / parserRef.full
    if (file.exists) {
      loadFromBytes(ByteBuffer.wrap(file.byteArray))
    } else {
      Failure(new FileNotFoundException(file.pathAsString))
    }
  }

  def loadFromBytes(bytes: ByteBuffer) =
    Try(Unpickle[ParserSkillsColdStorage].fromBytes(bytes))


  def saveToDisk(parserSkills: ParserSkillsColdStorage): File = {
    val file = DataDirectory.parserSkills / parserSkills.parserRef.full

    file.delete(true)
    file.touch()

    val bytes = Pickle.intoBytes(parserSkills)
    file.writeByteArray(bytes.array())
    file
  }
}