package com.opticdev.core.sourceparsers

case class FileParseException(message: String = "", cause: Throwable = null)
  extends Exception(message, cause)

case class FileNotFoundParseException(message: String = "", cause: Throwable = null)
  extends Exception(message, cause)

case class NoParserFoundException(message: String = "", cause: Throwable = null)
  extends Exception(message, cause)
