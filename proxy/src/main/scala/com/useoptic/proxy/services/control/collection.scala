package com.useoptic.proxy.services.control

import com.useoptic.proxy.collection.url.URLHint
import com.useoptic.proxy.{OpticAPIConfiguration}
import play.api.libs.json.Json

package object collection {
  object Protocol {
    implicit val urlHintFormats = Json.format[URLHint]
    implicit val opticAPIConfigurationFormats = Json.format[OpticAPIConfiguration]
  }
}
