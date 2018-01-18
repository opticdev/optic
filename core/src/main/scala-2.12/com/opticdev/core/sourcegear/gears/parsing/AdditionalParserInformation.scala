package com.opticdev.core.sourcegear.gears.parsing

import com.opticdev.parsers.IdentifierNodeDesc
import com.opticdev.parsers.graph.AstType

case class AdditionalParserInformation(identifierNodeDesc: IdentifierNodeDesc,
                                       blockNodeTypes: Seq[AstType])
