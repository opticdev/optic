package com.opticdev.core.compiler.stages

import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.opm.context.{PackageContext, PackageContextFixture}
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, Json}
import com.opticdev.sdk.descriptions._
import com.opticdev.sdk.descriptions.enums.FinderEnums.Entire
import com.opticdev.sdk.opticmarkdown2.lens.{OMLens, OMLensCodeComponent, OMStringFinder, Token}
import com.opticdev.sdk.opticmarkdown2.schema.OMSchema

class ValidationStageSpec extends FunSpec {

  val basicSchema = OMSchema(SchemaRef(Some(PackageRef("test")), "test"), Json.parse("""{
                            "title": "Test",
                            "version": "1.0.0",
                            "slug": "test",
                            "type": "object",
                            "properties": {
                                "firstName": {
                                    "type": "string"
                                },
                                "lastName": {
                                    "type": "string"
                                },
                                "age": {
                                    "description": "Age in years",
                                    "type": "integer",
                                    "minimum": 0
                                }
                            },
                            "required": ["firstName", "lastName"]
                        }""").as[JsObject])


  implicit val packageContext = PackageContextFixture(Map(basicSchema.schemaRef.full -> basicSchema))

  it("works properly") {
    implicit val lens: OMLens = OMLens(Some("Example"), "example", null, Map(
    "firstName" ->  OMLensCodeComponent(Token, OMStringFinder(Entire, "thing")),
    "lastName" ->  OMLensCodeComponent(Token, OMStringFinder(Entire, "thing"))
    ), Map(), Map(), Left(basicSchema.schemaRef), JsObject.empty, null)

    val validationStage = new ValidationStage()

    val results = validationStage.run

    assert(results.isValid)
    assert(results.extraPaths.isEmpty)
    assert(results.missingPaths.isEmpty)

  }

  it("finds extra fields") {
    implicit val lens: OMLens = OMLens(Some("Example"), "example", null, Map(
      "firstName" ->  OMLensCodeComponent(Token, OMStringFinder(Entire, "thing")),
      "lastName" ->  OMLensCodeComponent(Token, OMStringFinder(Entire, "thing")),
      "fakePROP" ->  OMLensCodeComponent(Token, OMStringFinder(Entire, "thing")),
      "fakePROP2" ->  OMLensCodeComponent(Token, OMStringFinder(Entire, "thing"))

    ), Map(), Map(), Left(basicSchema.schemaRef), JsObject.empty, null)

    val validationStage = new ValidationStage()

    val results = validationStage.run

    assert(!results.isValid)
    assert(results.extraPaths.size == 2)
    assert(results.extraPaths == Set(Seq("fakePROP"), Seq("fakePROP2")))
    assert(results.missingPaths.isEmpty)

  }


  it("finds missing fields") {
    implicit val lens: OMLens = OMLens(Some("Example"), "example", null, Map(
      "firstName" ->  OMLensCodeComponent(Token, OMStringFinder(Entire, "thing"))
    ), Map(), Map(), Left(basicSchema.schemaRef), JsObject.empty, null)

    val validationStage = new ValidationStage()

    val results = validationStage.run

    assert(!results.isValid)
    assert(results.extraPaths.isEmpty)
    assert(results.missingPaths.size == 1)

  }

it("finds missing fields when extra ones are present") {
  implicit val lens: OMLens = OMLens(Some("Example"), "example", null, Map(
    "firstName" ->  OMLensCodeComponent(Token, OMStringFinder(Entire, "thing")),
    "fakePROP2" ->  OMLensCodeComponent(Token, OMStringFinder(Entire, "thing"))
  ), Map(), Map(), Left(basicSchema.schemaRef), JsObject.empty, null)

  val validationStage = new ValidationStage()

  val results = validationStage.run

  assert(!results.isValid)
  assert(results.extraPaths.size == 1)
  assert(results.missingPaths.size == 1)
  assert(results.missingPaths == Set(Seq("lastName")))

}

}
