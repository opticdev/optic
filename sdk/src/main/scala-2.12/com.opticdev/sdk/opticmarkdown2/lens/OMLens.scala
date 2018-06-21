package com.opticdev.sdk.opticmarkdown2.lens

import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.parsers.rules.ChildrenRuleTypeEnum
import com.opticdev.sdk.descriptions.Snippet
import com.opticdev.sdk.opticmarkdown2.{OMChildrenRuleType, OMSnippet}
import com.opticdev.sdk.opticmarkdown2.schema.OMSchema
import play.api.libs.json.JsObject

case class OMLens(name: String,
                  id: String,
                  snippet: OMSnippet,
                  value: Map[String, OMLensComponent],
                  variables: Map[String, OMLensVariableScopeEnum],
                  containers: Map[String, OMChildrenRuleType],
                  schema: Either[SchemaRef, OMSchema],
                  initialValue: JsObject = JsObject.empty,
                  packageRef: PackageRef)


