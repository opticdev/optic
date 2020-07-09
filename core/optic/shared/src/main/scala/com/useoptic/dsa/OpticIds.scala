package com.useoptic.dsa

import com.useoptic.contexts.requests.Commands.{PathComponentId, RequestId, RequestParameterId, ResponseId}
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
  private val random = new Random()
  override def nextId(): String = {
    val currentValue = (random.alphanumeric take length).mkString
    s"${prefix}${delimiter}${currentValue}"
  }
}


abstract class OpticDomainIds {
  def newShapeId: ShapeId
  def newPathId: PathComponentId
  def newRequestId: RequestId
  def newResponseId: ResponseId
  def newRequestParameterId: RequestParameterId
  def newShapeParameterId: ShapeParameterId
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

    private val _shapeParameter = new SequentialIdGenerator("shape-parameter", "_")
    override def newShapeParameterId: ShapeParameterId = _shapeParameter.nextId()

    private val _requestParameter = new SequentialIdGenerator("request-parameter", "_")
    override def newRequestParameterId: RequestParameterId = _requestParameter.nextId()

    private val _field = new SequentialIdGenerator("field", "_")
    override def newFieldId: FieldId = _field.nextId()
  }

  def newPrefixedDeterministicIdGenerator(prefix: String) = new OpticDomainIds {
    private val _shape = new SequentialIdGenerator(s"${prefix}-shape", "_")
    override def newShapeId: ShapeId = _shape.nextId()

    private val _path = new SequentialIdGenerator(s"${prefix}-path", "_")
    override def newPathId: PathComponentId = _path.nextId()

    private val _request = new SequentialIdGenerator(s"${prefix}-request", "_")
    override def newRequestId: RequestId = _request.nextId()

    private val _response = new SequentialIdGenerator(s"${prefix}-response", "_")
    override def newResponseId: ResponseId = _response.nextId()

    private val _shapeParameter = new SequentialIdGenerator(s"${prefix}-shape-parameter", "_")
    override def newShapeParameterId: ShapeParameterId = _shapeParameter.nextId()

    private val _requestParameter = new SequentialIdGenerator(s"${prefix}-request-parameter", "_")
    override def newRequestParameterId: RequestParameterId = _requestParameter.nextId()

    private val _field = new SequentialIdGenerator(s"${prefix}-field", "_")
    override def newFieldId: FieldId = _field.nextId()
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

    private val _shapeParameter = new RandomAlphanumericIdGenerator("shape-parameter", "_")
    override def newShapeParameterId: ShapeParameterId = _shapeParameter.nextId()

    private val _requestParameter = new RandomAlphanumericIdGenerator("request-parameter", "_")
    override def newRequestParameterId: RequestParameterId = _requestParameter.nextId()

    private val _field = new RandomAlphanumericIdGenerator("field", "_")
    override def newFieldId: FieldId = _field.nextId()
  }

  def generator: OpticDomainIds = {
    if (System.getenv("SCALA_ENV") == "test") {
      newDeterministicIdGenerator
    } else {
      newRandomIdGenerator
    }
  }

}
