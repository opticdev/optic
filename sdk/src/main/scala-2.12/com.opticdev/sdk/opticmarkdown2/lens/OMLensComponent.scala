package com.opticdev.sdk.opticmarkdown2.lens

import com.opticdev.common.SchemaRef
import com.opticdev.sdk.descriptions.enums.BasicComponentType
import com.opticdev.sdk.opticmarkdown2.OMRange

trait OMLensComponent

case class OMLensCodeComponent(`type`: OMLensComponentType, at: OMLensNodeFinder) extends OMLensComponent

sealed trait OMLensComponentType
case object Token extends OMLensComponentType
case object Literal extends OMLensComponentType
case object ObjectLiteral extends OMLensComponentType

case class OMLensNodeFinder(astType: String, range: OMRange)

case class OMLensSchemaComponent(schemaRef: SchemaRef,
                                 unique: Boolean = false,
                                 toMap: Option[String] = None, //key property. when defined mapping will be applied to an object keyed by this string
                                 inContainer: Option[String] = None //only will search a container if defined, global if empty
                                ) extends OMLensComponent