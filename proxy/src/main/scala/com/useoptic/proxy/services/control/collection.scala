package com.useoptic.proxy.services.control

import com.useoptic.common.spec_types.AuthenticationScheme
import com.useoptic.proxy.collection.url.URLHint
import com.useoptic.proxy.OpticAPIConfiguration
import play.api.libs.json.Json
import com.useoptic.common.spec_types.SpecJSONSerialization.authenticationSchemaFormats

package object collection {
  object Protocol {
    implicit val urlHintFormats = Json.format[URLHint]
    implicit val opticAPIConfigurationFormats = Json.format[OpticAPIConfiguration]
  }
}
