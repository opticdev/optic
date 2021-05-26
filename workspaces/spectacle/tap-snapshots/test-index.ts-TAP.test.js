/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict';
exports[
  `test/index.ts TAP spectacle batchCommits query > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "batchCommits": Array [],
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query add contributions > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "added",
          },
          "contributions": Object {
            "purpose": "Get your account details",
          },
          "method": "GET",
          "path": "/api/account",
          "pathId": "path_UGayMWEUve",
        },
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "contributions": Object {
            "purpose": "Get information about a specific spec",
          },
          "method": "GET",
          "path": "/api/specs/{specId}",
          "pathId": "path_td6dXtR2C5",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query add endpoint to existing spec > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "added",
          },
          "contributions": Object {},
          "method": "POST",
          "path": "/user",
          "pathId": "path_Rbkw7kMyjT",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query add nested response field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "contributions": Object {},
          "method": "GET",
          "path": "/user",
          "pathId": "path_jhNaeRecHD",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query add new endpoint > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "added",
          },
          "contributions": Object {},
          "method": "GET",
          "path": "/user",
          "pathId": "path_Rbkw7kMyjT",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query add optional response field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "contributions": Object {},
          "method": "GET",
          "path": "/user",
          "pathId": "path_Rbkw7kMyjT",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query add request and response > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "added",
          },
          "contributions": Object {},
          "method": "POST",
          "path": "/user",
          "pathId": "path_jhNaeRecHD",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query add request field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "contributions": Object {},
          "method": "POST",
          "path": "/user",
          "pathId": "path_jhNaeRecHD",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query add request nested field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "contributions": Object {},
          "method": "POST",
          "path": "/user",
          "pathId": "path_jhNaeRecHD",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query add required response field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "contributions": Object {},
          "method": "GET",
          "path": "/user",
          "pathId": "path_Rbkw7kMyjT",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query add response array field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "contributions": Object {},
          "method": "GET",
          "path": "/user",
          "pathId": "path_jhNaeRecHD",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query add response as an array > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "added",
          },
          "contributions": Object {},
          "method": "GET",
          "path": "/items",
          "pathId": "path_H8I4tQ9R0s",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query add response as an array with object > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "added",
          },
          "contributions": Object {},
          "method": "GET",
          "path": "/items2",
          "pathId": "path_cvQ3CMEF5h",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query add response status code > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "contributions": Object {},
          "method": "GET",
          "path": "/user",
          "pathId": "path_Rbkw7kMyjT",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query complex changes > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "added",
          },
          "contributions": Object {},
          "method": "GET",
          "path": "/test2",
          "pathId": "path_UTBFhSCjRy",
        },
        Null Object {
          "change": Null Object {
            "category": "added",
          },
          "contributions": Object {},
          "method": "GET",
          "path": "/test1/{id}",
          "pathId": "path_NbM6PpK4t8",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query mark request field optional > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "contributions": Object {},
          "method": "POST",
          "path": "/user",
          "pathId": "path_jhNaeRecHD",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query mark request nested field optional > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "contributions": Object {},
          "method": "POST",
          "path": "/user",
          "pathId": "path_jhNaeRecHD",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query no changes > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query update nested response field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "contributions": Object {},
          "method": "GET",
          "path": "/user",
          "pathId": "path_jhNaeRecHD",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query update optional response field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "contributions": Object {},
          "method": "GET",
          "path": "/user",
          "pathId": "path_Rbkw7kMyjT",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query update request field type > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "contributions": Object {},
          "method": "POST",
          "path": "/user",
          "pathId": "path_jhNaeRecHD",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle changelog query updated response as an array > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "contributions": Object {},
          "method": "GET",
          "path": "/items",
          "pathId": "path_H8I4tQ9R0s",
        },
      ],
    },
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query add contributions > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/healthcheck",
        "absolutePathPatternWithParameterNames": "/healthcheck",
        "isParameterized": false,
        "name": "healthcheck",
        "pathId": "path_to6GIY7tL3",
      },
      Null Object {
        "absolutePathPattern": "/api",
        "absolutePathPatternWithParameterNames": "/api",
        "isParameterized": false,
        "name": "api",
        "pathId": "path_inB9snEwIX",
      },
      Null Object {
        "absolutePathPattern": "/api/account",
        "absolutePathPatternWithParameterNames": "/api/account",
        "isParameterized": false,
        "name": "account",
        "pathId": "path_UGayMWEUve",
      },
      Null Object {
        "absolutePathPattern": "/api/account/tokens",
        "absolutePathPatternWithParameterNames": "/api/account/tokens",
        "isParameterized": false,
        "name": "tokens",
        "pathId": "path_Zbx2qte52s",
      },
      Null Object {
        "absolutePathPattern": "/api/account/specs",
        "absolutePathPatternWithParameterNames": "/api/account/specs",
        "isParameterized": false,
        "name": "specs",
        "pathId": "path_jleYfnE1Ru",
      },
      Null Object {
        "absolutePathPattern": "/api/specs",
        "absolutePathPatternWithParameterNames": "/api/specs",
        "isParameterized": false,
        "name": "specs",
        "pathId": "path_g0KKrcDA4C",
      },
      Null Object {
        "absolutePathPattern": "/api/specs/{}",
        "absolutePathPatternWithParameterNames": "/api/specs/{specId}",
        "isParameterized": true,
        "name": "specId",
        "pathId": "path_td6dXtR2C5",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query add endpoint to existing spec > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_Rbkw7kMyjT",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query add nested response field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_jhNaeRecHD",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query add new endpoint > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_Rbkw7kMyjT",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query add optional response field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_Rbkw7kMyjT",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query add request and response > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_jhNaeRecHD",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query add request field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_jhNaeRecHD",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query add request nested field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_jhNaeRecHD",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query add required response field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_Rbkw7kMyjT",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query add response array field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_jhNaeRecHD",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query add response as an array > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_jhNaeRecHD",
      },
      Null Object {
        "absolutePathPattern": "/items",
        "absolutePathPatternWithParameterNames": "/items",
        "isParameterized": false,
        "name": "items",
        "pathId": "path_H8I4tQ9R0s",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query add response as an array with object > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_jhNaeRecHD",
      },
      Null Object {
        "absolutePathPattern": "/items",
        "absolutePathPatternWithParameterNames": "/items",
        "isParameterized": false,
        "name": "items",
        "pathId": "path_H8I4tQ9R0s",
      },
      Null Object {
        "absolutePathPattern": "/items2",
        "absolutePathPatternWithParameterNames": "/items2",
        "isParameterized": false,
        "name": "items2",
        "pathId": "path_cvQ3CMEF5h",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query add response status code > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_Rbkw7kMyjT",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query complex changes > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_Rbkw7kMyjT",
      },
      Null Object {
        "absolutePathPattern": "/test2",
        "absolutePathPatternWithParameterNames": "/test2",
        "isParameterized": false,
        "name": "test2",
        "pathId": "path_UTBFhSCjRy",
      },
      Null Object {
        "absolutePathPattern": "/test1",
        "absolutePathPatternWithParameterNames": "/test1",
        "isParameterized": false,
        "name": "test1",
        "pathId": "path_OC3glljopB",
      },
      Null Object {
        "absolutePathPattern": "/test1/{}",
        "absolutePathPatternWithParameterNames": "/test1/{id}",
        "isParameterized": true,
        "name": "id",
        "pathId": "path_NbM6PpK4t8",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query mark request field optional > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_jhNaeRecHD",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query mark request nested field optional > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_jhNaeRecHD",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query no changes > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_Rbkw7kMyjT",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query update nested response field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_jhNaeRecHD",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query update optional response field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_Rbkw7kMyjT",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query update request field type > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_jhNaeRecHD",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle paths query updated response as an array > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "paths": Array [
      Null Object {
        "absolutePathPattern": "/",
        "absolutePathPatternWithParameterNames": "/",
        "isParameterized": false,
        "name": "",
        "pathId": "root",
      },
      Null Object {
        "absolutePathPattern": "/user",
        "absolutePathPatternWithParameterNames": "/user",
        "isParameterized": false,
        "name": "user",
        "pathId": "path_jhNaeRecHD",
      },
      Null Object {
        "absolutePathPattern": "/items",
        "absolutePathPatternWithParameterNames": "/items",
        "isParameterized": false,
        "name": "items",
        "pathId": "path_H8I4tQ9R0s",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query add contributions > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": null,
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query add endpoint to existing spec > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_9E8tMaN7pT",
              "name": "age",
              "shapeId": "shape_ITEgMzZBoj",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_4aBRTBkk3X",
              "name": "name",
              "shapeId": "shape_XPEuTDdxkf",
            },
          ],
        },
        "id": "shape_jSAthS01Bb",
        "jsonType": "Object",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query add nested response field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": true,
                "changed": false,
              },
              "fieldId": "field_IssIgRCXER",
              "name": "value",
              "shapeId": "shape_5iIJpuVfvT",
            },
          ],
        },
        "id": "shape_JMawGfOvqm",
        "jsonType": "Object",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query add new endpoint > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [],
        },
        "id": "shape_jSAthS01Bb",
        "jsonType": "Object",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query add optional response field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": true,
                "changed": false,
              },
              "fieldId": "field_9E8tMaN7pT",
              "name": "age",
              "shapeId": "shape_I5A5eab4Wu",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_4aBRTBkk3X",
              "name": "name",
              "shapeId": "shape_XPEuTDdxkf",
            },
          ],
        },
        "id": "shape_jSAthS01Bb",
        "jsonType": "Object",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query add request and response > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": true,
                "changed": false,
              },
              "fieldId": "field_Uo8THxvA3Q",
              "name": "name",
              "shapeId": "shape_X6m1bO8KVI",
            },
          ],
        },
        "id": "shape_Uepabr07Dx",
        "jsonType": "Object",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query add request field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": true,
                "changed": false,
              },
              "fieldId": "field_qTPFUl6rR7",
              "name": "age",
              "shapeId": "shape_ZKhqeNIFuX",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_Uo8THxvA3Q",
              "name": "name",
              "shapeId": "shape_X6m1bO8KVI",
            },
          ],
        },
        "id": "shape_Uepabr07Dx",
        "jsonType": "Object",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query add request nested field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": true,
                "changed": false,
              },
              "fieldId": "field_mUYKwMbnjm",
              "name": "address",
              "shapeId": "shape_D8Wv86lkdr",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_qTPFUl6rR7",
              "name": "age",
              "shapeId": "shape_KSUYvkm6ox",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_Uo8THxvA3Q",
              "name": "name",
              "shapeId": "shape_asZ4dzA9x3",
            },
          ],
        },
        "id": "shape_Uepabr07Dx",
        "jsonType": "Object",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query add required response field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": true,
                "changed": false,
              },
              "fieldId": "field_4aBRTBkk3X",
              "name": "name",
              "shapeId": "shape_XPEuTDdxkf",
            },
          ],
        },
        "id": "shape_jSAthS01Bb",
        "jsonType": "Object",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query add response array field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": true,
                "changed": false,
              },
              "fieldId": "field_xk15eeYH4w",
              "name": "tags",
              "shapeId": "shape_megfFuiPyy",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_4OLWrfuNYd",
              "name": "nested",
              "shapeId": "shape_JMawGfOvqm",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_dcFiUByTEC",
              "name": "name",
              "shapeId": "shape_OzJqDlruot",
            },
          ],
        },
        "id": "shape_Fp2ke8xB9K",
        "jsonType": "Object",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query add response as an array > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": Null Object {
          "changes": Null Object {
            "added": true,
            "changed": false,
          },
        },
        "asObject": null,
        "id": "shape_Sn2bnZvvoM",
        "jsonType": "Array",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query add response as an array with object > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": Null Object {
          "changes": Null Object {
            "added": true,
            "changed": false,
          },
        },
        "asObject": null,
        "id": "shape_oCUwskX7xA",
        "jsonType": "Array",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query add response status code > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_9E8tMaN7pT",
              "name": "age",
              "shapeId": "shape_ITEgMzZBoj",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_4aBRTBkk3X",
              "name": "name",
              "shapeId": "shape_XPEuTDdxkf",
            },
          ],
        },
        "id": "shape_jSAthS01Bb",
        "jsonType": "Object",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query complex changes > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_9E8tMaN7pT",
              "name": "age",
              "shapeId": "shape_ITEgMzZBoj",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_4aBRTBkk3X",
              "name": "name",
              "shapeId": "shape_XPEuTDdxkf",
            },
          ],
        },
        "id": "shape_jSAthS01Bb",
        "jsonType": "Object",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query mark request field optional > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_qTPFUl6rR7",
              "name": "age",
              "shapeId": "shape_KSUYvkm6ox",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": true,
              },
              "fieldId": "field_Uo8THxvA3Q",
              "name": "name",
              "shapeId": "shape_asZ4dzA9x3",
            },
          ],
        },
        "id": "shape_Uepabr07Dx",
        "jsonType": "Object",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query mark request nested field optional > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_mUYKwMbnjm",
              "name": "address",
              "shapeId": "shape_D8Wv86lkdr",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_qTPFUl6rR7",
              "name": "age",
              "shapeId": "shape_KSUYvkm6ox",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_Uo8THxvA3Q",
              "name": "name",
              "shapeId": "shape_asZ4dzA9x3",
            },
          ],
        },
        "id": "shape_Uepabr07Dx",
        "jsonType": "Object",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query no changes > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_9E8tMaN7pT",
              "name": "age",
              "shapeId": "shape_ITEgMzZBoj",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_4aBRTBkk3X",
              "name": "name",
              "shapeId": "shape_XPEuTDdxkf",
            },
          ],
        },
        "id": "shape_jSAthS01Bb",
        "jsonType": "Object",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query update nested response field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": true,
              },
              "fieldId": "field_IssIgRCXER",
              "name": "value",
              "shapeId": "shape_23Xx7wgrkn",
            },
          ],
        },
        "id": "shape_JMawGfOvqm",
        "jsonType": "Object",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query update optional response field > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": true,
              },
              "fieldId": "field_9E8tMaN7pT",
              "name": "age",
              "shapeId": "shape_ITEgMzZBoj",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_4aBRTBkk3X",
              "name": "name",
              "shapeId": "shape_XPEuTDdxkf",
            },
          ],
        },
        "id": "shape_jSAthS01Bb",
        "jsonType": "Object",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query update request field type > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": true,
              },
              "fieldId": "field_qTPFUl6rR7",
              "name": "age",
              "shapeId": "shape_KSUYvkm6ox",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_Uo8THxvA3Q",
              "name": "name",
              "shapeId": "shape_X6m1bO8KVI",
            },
          ],
        },
        "id": "shape_Uepabr07Dx",
        "jsonType": "Object",
      },
    ],
  },
}
`;

exports[
  `test/index.ts TAP spectacle shapeChoices query updated response as an array > must match snapshot 1`
] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": Null Object {
          "changes": Null Object {
            "added": false,
            "changed": true,
          },
        },
        "asObject": null,
        "id": "shape_Sn2bnZvvoM",
        "jsonType": "Array",
      },
    ],
  },
}
`;
