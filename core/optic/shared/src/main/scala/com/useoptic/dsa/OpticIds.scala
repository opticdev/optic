package com.useoptic.dsa

import com.useoptic.contexts.requests.Commands.{PathComponentId, RequestId, ResponseId}
import com.useoptic.contexts.shapes.Commands.{FieldId, ShapeId, ShapeParameterId}

import scala.util.Random

trait OpticIds[T] {
  def nextId(): T
}

class SequentialIdGenerator(prefix: String = "", delimiter: String = "") extends OpticIds[String] {
  val source = Stream.from(1, 1).iterator

  override def nextId(): String = {
    val currentValue = source.next()
    s"${prefix}${delimiter}${currentValue}"
  }
}

class RandomAlphanumericIdGenerator(prefix: String = "", delimiter: String = "", length: Int = 10) extends OpticIds[String] {
  override def nextId(): String = {
    val currentValue = (Random.alphanumeric take length).mkString
    s"${prefix}${delimiter}${currentValue}"
  }
}


abstract class OpticDomainIds {
  def newShapeId: ShapeId
  def newPathId: PathComponentId
  def newRequestId: RequestId
  def newResponseId: ResponseId
  def newParameterId: ShapeParameterId
  def newFieldId: FieldId
}

object OpticIds {

  def newDeterministicIdGenerator = new OpticDomainIds {
    private val _shape = new SequentialIdGenerator("shape", "_")
    override def newShapeId: ShapeId = _shape.nextId()

    private val _path = new SequentialIdGenerator("path", "_")
    override def newPathId: PathComponentId = _path.nextId()

    private val _request = new SequentialIdGenerator("request", "_")
    override def newRequestId: RequestId = _request.nextId()

    private val _response = new SequentialIdGenerator("response", "_")
    override def newResponseId: ResponseId = _response.nextId()

    private val _parameter = new SequentialIdGenerator("parameter", "_")
    override def newParameterId: ShapeParameterId = _parameter.nextId()

    private val _field = new SequentialIdGenerator("field", "_")
    override def newFieldId: FieldId = _parameter.nextId()
  }

  def newRandomIdGenerator = new OpticDomainIds {
    private val _shape = new RandomAlphanumericIdGenerator("shape", "_")
    override def newShapeId: ShapeId = _shape.nextId()

    private val _path = new RandomAlphanumericIdGenerator("path", "_")
    override def newPathId: PathComponentId = _path.nextId()

    private val _request = new RandomAlphanumericIdGenerator("request", "_")
    override def newRequestId: RequestId = _request.nextId()

    private val _response = new RandomAlphanumericIdGenerator("response", "_")
    override def newResponseId: ResponseId = _response.nextId()

    private val _parameter = new RandomAlphanumericIdGenerator("shape-parameter", "_")
    override def newParameterId: ShapeParameterId = _parameter.nextId()

    private val _field = new RandomAlphanumericIdGenerator("field", "_")
    override def newFieldId: FieldId = _parameter.nextId()
  }

  def generator: OpticDomainIds = {
    if (System.getenv("SCALA_ENV") == "test") {
      newDeterministicIdGenerator
    } else {
      newRandomIdGenerator
    }
  }

}
