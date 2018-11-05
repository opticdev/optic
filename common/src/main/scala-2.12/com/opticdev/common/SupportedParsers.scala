package com.opticdev.common

import com.opticdev.parsers.SourceParserManager
import com.opticdev.parsers.es7
import com.opticdev.parsers.scala

object SupportedParsers {

  lazy val parsers = Seq(
    new es7.OpticParser,
    new scala.OpticParser,
  )

  def init = {
    parsers.foreach(lang=> SourceParserManager.enableParser(lang))
  }

  def allParserRefs = parsers.map(_.parserRef)

}
