package com.useoptic.end_to_end

import com.useoptic.dsa.OpticIds
import com.useoptic.end_to_end.fixtures.InteractionHelpers._
import com.useoptic.end_to_end.snapshot_task.{EndEndDiffTask, TestDataHelper}
import io.circe.Json
import io.circe.literal._


class DiffUseCasesSpec extends EndEndDiffTask {

  val personInteraction = newInteraction("GET", "/users/1234/profile", 200,
    responseBody = json"""{ "firstName": "Aidan", "lastName": "C", "age": 26, "cities": ["San Fransisco", "New York", "Durham"]}""")

  val baselineEvents = {
    implicit val ids = OpticIds.newDeterministicIdGenerator
    new TestDataHelper("root-shape-is-object-with-keys").learnBaselineEvents(
      path = Vector("users", ":userId", "profile"),
      interactions = Vector(personInteraction))
  }


  println(baselineEvents._1)

  when("a known field is missing", () => EndEndDiffTask.Input(baselineEvents._1, Vector(
    personInteraction.forkResponseBody(json => {
      val obj = json.asObject.get.remove("firstName")
      Json.fromJsonObject(obj)
    })
  )))



  runSuite
}
