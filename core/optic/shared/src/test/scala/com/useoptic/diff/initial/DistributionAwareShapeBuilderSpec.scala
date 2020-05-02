package com.useoptic.diff.initial

import com.useoptic.contexts.shapes.ShapesHelper.StringKind
import com.useoptic.diff.shapes.JsonTrailPathComponent.JsonObjectKey
import com.useoptic.end_to_end.fixtures.JsonExamples
import com.useoptic.types.capture.JsonLikeFrom
import org.scalatest.FunSpec

class DistributionAwareShapeBuilderSpec extends FunSpec {

  describe("aggregate values by trails") {

    lazy val todoMap = DistributionAwareShapeBuilder.aggregateTrailsAndValues(Vector(
      JsonLikeFrom.json(JsonExamples.basicTodo).get,
      JsonLikeFrom.json(JsonExamples.basicTodoWithDescription).get,
      JsonLikeFrom.json(JsonExamples.basicTodoWithoutStatus).get,
    ))


    it("collects values for entire fieldset") {
      val keys = todoMap.toMap.collect {
        case (path, values) if path.path.size == 1 && path.path.head.isInstanceOf[JsonObjectKey] => path.path.head.asInstanceOf[JsonObjectKey].key
      }
      assert(keys.toSet == Set("isDone", "description", "message"))
    }

    it("can stage object for creation with some optional fields") {
      val shapesToMake = DistributionAwareShapeBuilder.toShapes(todoMap)
      assert(shapesToMake.isInstanceOf[ObjectWithFields])
      assert(shapesToMake.asInstanceOf[ObjectWithFields].fields.size == 3)
      println(shapesToMake.asInstanceOf[ObjectWithFields].fields)
      assert(shapesToMake.asInstanceOf[ObjectWithFields].fields.count(_.shape.isInstanceOf[OptionalShape]) == 2)
    }

    it("can stage array for creation with example items all of same type") {

      lazy val stringArrayMap = DistributionAwareShapeBuilder.aggregateTrailsAndValues(Vector(
        JsonLikeFrom.json(JsonExamples.stringArray).get
      ))

      val shapesToMake = DistributionAwareShapeBuilder.toShapes(stringArrayMap)
      assert(shapesToMake.isInstanceOf[ListOfShape])
      assert(shapesToMake.asInstanceOf[ListOfShape].shape.isInstanceOf[PrimitiveKind])
      assert(shapesToMake.asInstanceOf[ListOfShape].shape.asInstanceOf[PrimitiveKind].baseShape == StringKind)
    }

    it("can stage array for creation with example items all of different types") {

      lazy val stringArrayMap = DistributionAwareShapeBuilder.aggregateTrailsAndValues(Vector(
        JsonLikeFrom.json(JsonExamples.stringArrayWithNumbers).get
      ))

      val shapesToMake = DistributionAwareShapeBuilder.toShapes(stringArrayMap)
      assert(shapesToMake.isInstanceOf[ListOfShape])
      assert(shapesToMake.asInstanceOf[ListOfShape].shape.isInstanceOf[OneOfShape])
      assert(shapesToMake.asInstanceOf[ListOfShape].shape.asInstanceOf[OneOfShape].branches.size == 2)
    }
  }

}
