package com.opticdev.core.sourcegear

import com.opticdev.core.sourcegear.accumulate.FileAccumulator
import com.opticdev.parsers.{AstGraph, ParserBase}

case class SGContext(var fileAccumulator: FileAccumulator,
                     var astGraph: AstGraph,
                     parser: ParserBase)
