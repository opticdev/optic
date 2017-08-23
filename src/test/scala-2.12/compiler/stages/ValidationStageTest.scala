package compiler.stages

import compiler_new.stages.ValidationStage
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, Json}
import sdk.descriptions.Component.CodeTypes
import sdk.descriptions.{Component, Lens, Schema}

class ValidationStageTest extends FunSpec {

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


  implicit val schemas = Vector(basicSchema)

  describe("Validation Stage") {

      it("works properly") {
        implicit val lens: Lens = Lens("Example", basicSchema.asSchemaId, null, Vector(
          Component(Component.Types.Code, CodeTypes.Token, "firstName", null),
          Component(Component.Types.Code, CodeTypes.Token, "lastName", null)
        ))

        val validationStage = new ValidationStage()

        val results = validationStage.run

        assert(results.isValid)
        assert(results.extraPaths.isEmpty)
        assert(results.missingPaths.isEmpty)

      }

      it("finds extra fields") {
        implicit val lens: Lens = Lens("Example", basicSchema.asSchemaId, null, Vector(
          Component(Component.Types.Code, CodeTypes.Token, "firstName", null),
          Component(Component.Types.Code, CodeTypes.Token, "lastName", null),
          Component(Component.Types.Code, CodeTypes.Token, "fakePROP", null),
          Component(Component.Types.Code, CodeTypes.Token, "fakePROP2", null)
        ))

        val validationStage = new ValidationStage()

        val results = validationStage.run

        assert(!results.isValid)
        assert(results.extraPaths.size == 2)
        assert(results.extraPaths == Set("fakePROP", "fakePROP2"))
        assert(results.missingPaths.isEmpty)

      }


      it("finds missing fields") {
        implicit val lens: Lens = Lens("Example", basicSchema.asSchemaId, null, Vector(
          Component(Component.Types.Code, CodeTypes.Token, "firstName", null)
        ))

        val validationStage = new ValidationStage()

        val results = validationStage.run

        assert(!results.isValid)
        assert(results.extraPaths.isEmpty)
        assert(results.missingPaths.size == 1)

      }

    it("finds missing fields when extra ones are present") {
      implicit val lens: Lens = Lens("Example", basicSchema.asSchemaId, null, Vector(
        Component(Component.Types.Code, CodeTypes.Token, "firstName", null),
        Component(Component.Types.Code, CodeTypes.Token, "fakePROP2", null)
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
