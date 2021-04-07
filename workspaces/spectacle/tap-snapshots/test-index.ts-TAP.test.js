/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/index.ts TAP spectacle batchCommits query > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "batchCommits": Array [],
  },
}
`

exports[`test/index.ts TAP spectacle changelog query add endpoint to existing spec > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "added",
          },
          "method": "POST",
          "path": "/user",
        },
      ],
    },
  },
}
`

exports[`test/index.ts TAP spectacle changelog query add new endpoint > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "added",
          },
          "method": "GET",
          "path": "/user",
        },
      ],
    },
  },
}
`

exports[`test/index.ts TAP spectacle changelog query add optional response field > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "method": "GET",
          "path": "/user",
        },
      ],
    },
  },
}
`

exports[`test/index.ts TAP spectacle changelog query add required response field > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "method": "GET",
          "path": "/user",
        },
      ],
    },
  },
}
`

exports[`test/index.ts TAP spectacle changelog query add response status code > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "method": "GET",
          "path": "/user",
        },
      ],
    },
  },
}
`

exports[`test/index.ts TAP spectacle changelog query no changes > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [],
    },
  },
}
`

exports[`test/index.ts TAP spectacle changelog query update optional response field > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "method": "GET",
          "path": "/user",
        },
      ],
    },
  },
}
`
