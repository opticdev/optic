package com.opticdev.server.analytics

import com.mixpanel.mixpanelapi.ClientDelivery
import com.mixpanel.mixpanelapi.MessageBuilder
import com.mixpanel.mixpanelapi.MixpanelAPI
import org.json.JSONObject
import com.opticdev.server.BuildInfo
import scala.util.Try

object MixpanelManager {

  lazy val uniqueName : String = {
    import java.util.prefs.Preferences

    val prefs = Preferences.userNodeForPackage(MixpanelManager.getClass)

    Try {
      val uniqueName = prefs.get("uniqueName", null)
      assert(uniqueName != null)
      uniqueName
    }.getOrElse {
      val haiku = HaikuGenerator.haiku
      prefs.put("uniqueName", haiku)
      prefs.flush()
      haiku
    }
  }

  private val messageBuilderOption  : Option[MessageBuilder] = Try {
    assert(BuildInfo.mixpanelToken != null)
    new MessageBuilder(BuildInfo.mixpanelToken)
  }.toOption

  private val mixpanel = new MixpanelAPI

  def event(mixPanelEvent: MixPanelEvent)(implicit isTest : Boolean = false) : Unit = {

    if (messageBuilderOption.isDefined) {

      val props = new JSONObject()
      props.put("uniqueName", uniqueName)

      val event = messageBuilderOption.get.event(mixPanelEvent.distinctId, mixPanelEvent.eventName, props)
      val delivery = new ClientDelivery
      delivery.addMessage(event)
      //swallow if in a test
      if (!isTest) {
        mixpanel.deliver(delivery)
      }
    }
  }

}

class MixPanelEvent(
  val distinctId: String,
  val eventName: String)

//Mixpanel Events
case object ServerStart extends MixPanelEvent("server-start", "Server Start")