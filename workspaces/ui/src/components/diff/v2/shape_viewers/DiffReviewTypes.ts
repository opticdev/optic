enum DiffKind {
  Added,
  Changed,
  Removed,
}

interface BodyLocation {
  contentType?: string;
  statusCode?: number;
  inRequest?: boolean;
  inResponse?: boolean;
}

interface IDiffWithInterpretations {
  mainInterpretation: string;
  readableIdentifier: string;
  kind: DiffKind;
  location: BodyLocation;
  tasks: string[];
  diffs: IDiffs[];
  suggestions: ISuggestion[];
}

interface ISuggestion {
  action: string;
  pastTense: string;
  id: string;
}

interface IDiffs {
  oneWordName: string;
  diffDescription: string;
  jsonExample: any;
}

export const HardCodedDiffExamples: IDiffWithInterpretations[] = [
  {
    mainInterpretation: 'missing field',
    readableIdentifier: 'currency',
    kind: DiffKind.Removed,
    location: {
      contentType: 'application/json',
      inRequest: true,
    },
    tasks: ['start', 'test', 'run-postman'],
    diffs: [
      {
        oneWordName: 'missing',
        diffDescription: 'currency is missing',
        jsonExample: {
          cartId: 'r4u3ih5jk',
          amount: 1535.32,
        },
      },
    ],
    suggestions: [
      {
        id: 'optional-it',
        action: 'Make field `currency` optional',
        pastTense: '`currency` is now optional',
      },
      {
        id: 'rempve-it',
        action: 'Remove field `currency`',
        pastTense: '`currency` has been removed',
      },
    ],
  },
  {
    mainInterpretation: 'new field',
    readableIdentifier: 'checkout-zip-code',
    kind: DiffKind.Added,
    location: {
      contentType: 'application/json',
      inRequest: true,
    },
    tasks: ['start'],
    diffs: [
      {
        oneWordName: 'as number',
        diffDescription: 'new field',
        jsonExample: {
          cartId: 'r4u3ih5jk',
          amount: 1535.32,
          'checkout-zip-code': 27797,
        },
      },
      {
        oneWordName: 'as string',
        diffDescription: 'new field',
        jsonExample: {
          cartId: 'r4u3ih5jk',
          amount: 1535.32,
          'checkout-zip-code': '27797-4055',
        },
      },
      {
        oneWordName: 'missing',
        diffDescription: 'new field is missing',
        jsonExample: {
          cartId: 'r4u3ih5jk',
          amount: 1535.32,
        },
      },
    ],
    suggestions: [
      {
        id: 'required-it',
        action: 'Add field `checkout-zip-code` as required String or Number',
        pastTense: 'Added `checkout-zip-code` as a required String or Number ',
      },
      {
        id: 'optional-it',
        action: 'Add field `checkout-zip-code` as optional String or Number',
        pastTense: 'Added `checkout-zip-code` as an optional String or Number ',
      },
    ],
  },
];
