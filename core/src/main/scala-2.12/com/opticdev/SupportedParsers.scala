package com.opticdev

import com.opticdev.parsers.{SourceParserManager, es7}

object SupportedParsers {

  lazy val parsers = Seq(
    new es7.OpticParser,
//    new scala.OpticParser,
  )

  def init = {
    parsers.foreach(lang=> SourceParserManager.enableParser(lang))
  }

  def allParserRefs = parsers.map(_.parserRef)

}
