package com.opticdev.core.compiler.stages

import com.opticdev.core.Fixture.MockPackageContext
import com.opticdev.opm.context.PackageContext
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, Json}
import com.opticdev.sdk.descriptions.enums.ComponentEnums._
import com.opticdev.sdk.descriptions.{CodeComponent, Component, Lens, Schema}

class ValidationStageTest extends FunSpec with MockPackageContext {

  val basicSchema = Schema(Json.parse("""{
                            "title": "Test",
                            "version": "test",
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


  implicit val packageContext: PackageContext = packageContext(Vector(basicSchema))

  describe("Validation Stage") {

      it("works properly") {
        implicit val lens: Lens = Lens("Example", basicSchema.asSchemaId, null, Vector(), Vector(
          CodeComponent(Token, "firstName", null),
          CodeComponent(Token, "lastName", null)
        ))

        val validationStage = new ValidationStage()

        val results = validationStage.run

        assert(results.isValid)
        assert(results.extraPaths.isEmpty)
        assert(results.missingPaths.isEmpty)

      }

      it("finds extra fields") {
        implicit val lens: Lens = Lens("Example", basicSchema.asSchemaId, null, Vector(), Vector(
          CodeComponent(Token, "firstName", null),
          CodeComponent(Token, "lastName", null),
          CodeComponent(Token, "fakePROP", null),
          CodeComponent(Token, "fakePROP2", null)
        ))

        val validationStage = new ValidationStage()

        val results = validationStage.run

        assert(!results.isValid)
        assert(results.extraPaths.size == 2)
        assert(results.extraPaths == Set("fakePROP", "fakePROP2"))
        assert(results.missingPaths.isEmpty)

      }


      it("finds missing fields") {
        implicit val lens: Lens = Lens("Example", basicSchema.asSchemaId, null, Vector(), Vector(
          CodeComponent(Token, "firstName", null)
        ))

        val validationStage = new ValidationStage()

        val results = validationStage.run

        assert(!results.isValid)
        assert(results.extraPaths.isEmpty)
        assert(results.missingPaths.size == 1)

      }

    it("finds missing fields when extra ones are present") {
      implicit val lens: Lens = Lens("Example", basicSchema.asSchemaId, null, Vector(), Vector(
        CodeComponent(Token, "firstName", null),
        CodeComponent(Token, "fakePROP2", null)
      ))

      val validationStage = new ValidationStage()

      val results = validationStage.run

      assert(!results.isValid)
      assert(results.extraPaths.size == 1)
      assert(results.missingPaths.size == 1)
      assert(results.missingPaths == Set("lastName"))

    }



  }

}
