package com.opticdev.server.data

import better.files.File
import play.api.libs.json.{JsObject, JsString}

trait ServerExceptions extends Exception {
  def asJson : JsObject = JsObject(Seq("error" -> JsString(getMessage)))
}

case class InternalServerException() extends ServerExceptions

case class FileNotInProjectException(file: File) extends ServerExceptions {
  override def getMessage: String = "File "+file.pathAsString+" is not in an optic project"
}

case class FileIsNotWatchedByProjectException(file: File) extends ServerExceptions {
  override def getMessage: String = "File "+file.pathAsString+" is not being watched by its optic project"
}

case class ModelNodeWithIdNotFound(id: String) extends ServerExceptions {
  override def getMessage: String = "Model node with id "+id+ " is not found. If files were updated, it may not exist anymore"
}