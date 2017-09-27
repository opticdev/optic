package sourcegear.serialization

import org.scalatest.FunSpec
import boopickle.Default._

class RangePickleTest extends FunSpec {
  describe("Range pickling") {

    val range = Range(1,2)
    it("Can pickle a range") {
      import com.opticdev.core.sourcegear.serialization.PickleImplicits._

      val asBytes = Pickle.intoBytes(range)

      assert(Unpickle[Range].fromBytes(asBytes) == Range(1,2))
    }

  }

}
