package com.useoptic.end_to_end.fixtures
import io.circe.literal._
object JsonExamples {

  //todo
  val basicTodo = json"""{"message": "Hello", "isDone": true}"""
  val basicTodoWithDescription = json"""{"message": "Hello", "isDone": true, "description": "Do it!"}"""
  val basicTodoWithoutStatus = json"""{"message": "Hello"}"""

}
