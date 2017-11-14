import com.opticdev.opm.OpticPackage
import play.api.libs.json.{JsObject, JsString}

package object opm {


  def mockPackage(name: String, author: String, version: String, dependencies: Seq[(String, String)]) = {
    OpticPackage(author+":"+name, JsObject(
      Seq(
        "name"-> JsString(name),
        "version"-> JsString(version),
        "author"-> JsString(author),
        "dependencies" -> JsObject(dependencies.map(i=> i._1 -> JsString(i._2)))
      )
    ))
  }

}
