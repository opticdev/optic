
package nl.codestar.scalatsi.generator

import _root_.nl.codestar.scalatsi.TSNamedType
import _root_.nl.codestar.scalatsi.TypescriptType.TypescriptNamedType
import _root_.java.io.File

/** User imports */

import com.useoptic.types.MyTSTypes._


object ApplicationTypescriptGeneration {

  // If you get a implicit not found error here, make sure you have defined a TSType[T] implicit and imported it
  val toOutput: Seq[TypescriptNamedType] = Seq(
    
      implicitly[TSNamedType[com.useoptic.types.capture.Capture]].get,
    
  )
  // TODO: If we want to support scala 2.11 the last must not have a trailing comma

  val options = _root_.nl.codestar.scalatsi.output.OutputOptions(
    targetFile = new File("/Users/aidancunniffe/Developer/optic2020/optic/types/build/optic-types.ts")
  )

  def main(args: Array[String]): Unit = {
    _root_.nl.codestar.scalatsi.output.WriteTSToFiles.write(options)(toOutput)
  }
}
