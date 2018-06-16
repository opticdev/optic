package com.opticdev.sdk.transformation.mutate

import com.opticdev.common.SchemaRef
import com.opticdev.sdk.descriptions.transformation.generate.StagedNode
import com.opticdev.sdk.descriptions.transformation.mutate.ContainerMutationOperation
import com.opticdev.sdk.descriptions.transformation.mutate.ContainerMutationOperationsEnum._
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, JsValue, Json}

class StagedContainerMutationJsonSpec extends FunSpec {
  import com.opticdev.sdk._

  def testRoundTrip(value: ContainerMutationOperation): ContainerMutationOperation = {
    Json.fromJson[ContainerMutationOperation](Json.toJson[ContainerMutationOperation](value)).get
  }

  it("can serialize/deserialize an append call") {
    val append = Append(Seq(StagedNode(SchemaRef.fromString("test:test/hello").get, JsObject.empty)))
    assert(testRoundTrip(append) == append)
  }

  it("can serialize/deserialize an prepend call") {
    val prepend = Prepend(Seq(StagedNode(SchemaRef.fromString("test:test/hello").get, JsObject.empty)))
    assert(testRoundTrip(prepend) == prepend)
  }


  it("can serialize/deserialize an replace with call") {
    val replace = ReplaceWith(Seq(StagedNode(SchemaRef.fromString("test:test/hello").get, JsObject.empty)))
    assert(testRoundTrip(replace) == replace)
  }

  it("can serialize/deserialize an insert at with call") {
    val insertAt = InsertAt(5, Seq(StagedNode(SchemaRef.fromString("test:test/hello").get, JsObject.empty)))
    assert(testRoundTrip(insertAt) == insertAt)
  }

  it("can serialize/deserialize an empty call") {
    val e = Empty()
    assert(testRoundTrip(e) == e)
  }


}
