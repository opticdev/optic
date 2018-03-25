package com.opticdev.server.analytics

import com.mixpanel.mixpanelapi.MessageBuilder
import org.scalatest.{FunSpec, PrivateMethodTester}

class AnalyticsSpec extends FunSpec with PrivateMethodTester {

  it("generate a random haiku") {
    assert(HaikuGenerator.haiku != HaikuGenerator.haiku)
  }

  it("can get the mixpanel token from BuildInfo") {
    val option = MixpanelManager invokePrivate PrivateMethod[Option[MessageBuilder]]('messageBuilderOption)()
    assert(option.isDefined)
  }

}
