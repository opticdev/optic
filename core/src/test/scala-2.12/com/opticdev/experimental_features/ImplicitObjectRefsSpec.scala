package com.opticdev.experimental_features

import com.opticdev.common.{ObjectRef, SchemaRef}
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, JsString}

class ImplicitObjectRefsSpec extends FunSpec {

  it("will provide a default name for endpoints") {

    val result = ImplicitObjectRefs.objectRefForModelNode(SchemaRef.fromString("optic:rest@2.0.0/route").get, JsObject(Seq(
      "url" -> JsString("/hello-world"),
      "method" -> JsString("post")
    )))

    assert(result.contains(ObjectRef("POST /hello-world")))

  }

  it("will return an empty option if a naming function isn't specified") {

    val result = ImplicitObjectRefs.objectRefForModelNode(SchemaRef.fromString("optic:rest@2.0.0/otherpackage").get, JsObject.empty)

    assert(result.isEmpty)

  }

}
