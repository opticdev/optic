package com.useoptic.proxy.services.control

import com.useoptic.proxy.collection.url.URLHint
import com.useoptic.proxy.{OpticAPIConfiguration, ProxyConfig}
import play.api.libs.json.Json

package object collection {
  object Protocol {
    implicit val urlHintFormats = Json.format[URLHint]
    implicit val proxyConfigFormats = Json.format[ProxyConfig]
    implicit val opticAPIConfigurationFormats = Json.format[OpticAPIConfiguration]
  }
}
