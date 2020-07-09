package com.useoptic.end_to_end

import com.useoptic.end_to_end.fixtures.JsonExamples
import com.useoptic.end_to_end.snapshot_task.BuildShapeTask
import io.circe.literal._

class ShapeBuilderUseCases extends BuildShapeTask {

  when("object is at root and some primitive fields are optional", () => BuildShapeTask.Input(Vector(
    JsonExamples.basicTodo,
    JsonExamples.basicTodoWithDescription,
    JsonExamples.basicTodoWithoutStatus
  )))

  when("array of strings", () => BuildShapeTask.Input(Vector(
    JsonExamples.stringArray,
  )))

  when("array of empty", () => BuildShapeTask.Input(Vector(
    JsonExamples.emptyArray,
  )))

  when("empty object", () => BuildShapeTask.Input(Vector(
    JsonExamples.emptyArray,
  )))

  when("empty object or empty array at root", () => BuildShapeTask.Input(Vector(
    JsonExamples.emptyArray,
    JsonExamples.emptyObject
  )))

  when("array with polymorhpism", () => BuildShapeTask.Input(Vector(
    JsonExamples.stringArrayWithNumbers,
  )))

  when("nullable field, later provided value", () => BuildShapeTask.Input(Vector(
    JsonExamples.objectWithNull,
    JsonExamples.objectWithNullAsString
  )))

  when("nullable field, later provided two different types", () => BuildShapeTask.Input(Vector(
    JsonExamples.objectWithNull,
    JsonExamples.objectWithNullAsString,
    JsonExamples.objectWithNullAsNumber
  )))

  when("field polymorphism, then nullable ", () => BuildShapeTask.Input(Vector(
    JsonExamples.objectWithNullAsString,
    JsonExamples.objectWithNullAsNumber,
    JsonExamples.objectWithNull,
  )))


  when("f1 race results", () => BuildShapeTask.Input(Vector(
    JsonExamples.racecar
  )))

  when("github commits", () => BuildShapeTask.Input(Vector(
    JsonExamples.allOpticCommits
  )))

  runSuite
}
