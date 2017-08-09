import compiler.JsUtils._
import org.scalatest.{FunSpec, FunSuite}
import play.api.libs.json.{JsBoolean, JsNumber, JsString}

class JsUtilsTest extends FunSpec {

  it("Works for double quotes") {
    assert(doubleQuotes("Hello") == "\"Hello\"")
  }

  it("It can convert a JsValue to Javascript code string") {

    assert( jsValueAsJsString( JsString("Hello") ) == "\"Hello\"" )
    assert( jsValueAsJsString( JsBoolean(true) ) == "true" )
    assert( jsValueAsJsString( JsBoolean(false) ) == "false" )
    assert( jsValueAsJsString( JsNumber(14) ) == "14" )
  }

}
