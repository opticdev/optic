package com.seamless.oas.oas_to_commands

import com.seamless.oas.ResolverTestFixture
import com.seamless.oas.QueryImplicits._
import RequestsToCommandsImplicits._
import com.seamless.contexts.data_types.Commands.AssignType
import com.seamless.contexts.requests.Commands.SetResponseBodyShape
import com.seamless.contexts.requests.Commands._
class RequestsToCommandsImplicitsSpec extends ResolverTestFixture("2") {

  val mattermostResolver = resolverFor(mattermost)

  it("can form commands from operations with multiple responses and a request body") {

    val commands = mattermostResolver.paths.~#("/users").operations.~#("post").toCommandStream

    //adds the responses correctly
    val statuses = commands.init.collect {
      case r: AddResponse => r.httpStatusCode
    }
    assert(statuses.size == 3)
    assert(statuses.toSet == Set(201, 400, 403))

    //response commands add their inline shapes to the events
    assert(commands.init.count(i => i.isInstanceOf[AssignType] && i.asInstanceOf[AssignType].to.isRef) == 4)
    assert(commands.describe.count(_.isInstanceOf[SetResponseBodyShape]) == 3)
    assert(commands.describe.count(_.isInstanceOf[SetRequestBodyShape]) == 1)
  }



}
