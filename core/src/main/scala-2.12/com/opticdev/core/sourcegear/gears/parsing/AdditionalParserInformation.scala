package com.opticdev.core.sourcegear.gears.parsing

import com.opticdev.parsers.IdentifierNodeDesc
import com.opticdev.common.graph.AstType

case class AdditionalParserInformation(identifierNodeDesc: IdentifierNodeDesc,
                                       blockNodeTypes: Seq[AstType])
