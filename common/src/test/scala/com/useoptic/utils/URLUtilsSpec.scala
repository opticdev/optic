package com.useoptic.utils

import io.lemonlabs.uri.Url
import org.scalatest.FunSpec

class URLUtilsSpec extends FunSpec {

  describe("Url cleaning") {
    it("Can remove query params from URL") {
      assert(URLUtils.urlWithoutQueryOrFragment(Url.parse("http://example.com/me?filter=them")).toString() ==
        "http://example.com/me")
    }

    it("Can remove fragment from URL") {
      assert(URLUtils.urlWithoutQueryOrFragment(Url.parse("http://example.com/#/them?filter=them")).toString() ==
        "http://example.com/")
    }
  }

}
