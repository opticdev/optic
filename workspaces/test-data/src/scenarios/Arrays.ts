import { Scenario } from '../helpers/Scenario';
import { newBody, newInteraction } from '../helpers/InteractionHelper';
import { TAGS } from '../helpers/TAGS';

const newExampleEvent = (name: string, attending: number) => ({
  name,
  attending,
});

Scenario('Empty Array at Root', ({ AddPath, LearnBaseline, when }) => {
  const exampleBodyBase: any = [];

  const interaction = newInteraction('/events', 'GET');
  interaction.withResponseBody(newBody(exampleBodyBase));

  const baseBody = interaction.requestBody;

  AddPath('events');
  LearnBaseline(interaction);

  when(
    'when unknown and provided with items',
    interaction.withResponseBody(
      baseBody?.fork((body) => {
        body = [
          newExampleEvent('Computer Time', 55),
          newExampleEvent('Cooking Class', 19),
        ];
      })
    ),
    TAGS.UNKNOWN_LIST_PROVIDED_WITH_ITEMS
  );
});

Scenario('Nested Array', ({ AddPath, LearnBaseline, when }) => {
  const exampleBodyBase: any = {
    colors: ['#00FFFF', '#FF00FF', '#C0C0C0'],
  };

  const interaction = newInteraction('/colors', 'GET');
  interaction.withResponseBody(newBody(exampleBodyBase));

  const baseBody = interaction.requestBody;

  AddPath('colors');
  LearnBaseline(interaction);

  when(
    'when presented with an empty array',
    interaction.withResponseBody(
      baseBody?.fork((body) => {
        body.colors = [];
      })
    ),
    TAGS.NO_DIFF_EXPECTED
  );

  when(
    'when provided with only items that do not match',
    interaction.withResponseBody(
      baseBody?.fork((body) => {
        body.colors = [1, 2, 3, true];
      })
    ),
    TAGS.ARRAY_ITEM_DOES_NOT_MATCH_ASSERTION
  );

  when(
    'when provided with some items that match and some that do not',
    interaction.withResponseBody(
      baseBody?.fork((body) => {
        body.colors = ['#e2e2e2', true];
      })
    ),
    TAGS.ARRAY_ITEM_DOES_NOT_MATCH_ASSERTION
  );

  when(
    'when provided with items that match and null',
    interaction.withResponseBody(
      baseBody?.fork((body) => {
        body.colors = ['#e2e2e2', null];
      })
    ),
    TAGS.ARRAY_ITEM_IS_NULL_AND_DOES_NOT_MATCH_ASSERTION
  );
});

Scenario('Array of arrays', ({ AddPath, LearnBaseline, when }) => {
  const exampleBodyBase: any = {
    athletes: [
      ['Brooks', { sport: 'golf' }],
      ['Woods', { sport: 'golf' }],
    ],
  };

  //should be learned as List[OneOf[String, Object]]

  const interaction = newInteraction('/athletes', 'GET');
  interaction.withResponseBody(newBody(exampleBodyBase));

  const baseBody = interaction.requestBody;

  AddPath('athletes');
  LearnBaseline(interaction);

  when(
    'when provided with items that match',
    interaction.withResponseBody(
      baseBody?.fork((body) => {
        body.athletes = [['Brooks', { sport: 'golf' }]];
      })
    ),
    TAGS.NO_DIFF_EXPECTED
  );

  when(
    'when the object part of the OneOf has a new field, it should create a diff',
    interaction.withResponseBody(
      baseBody?.fork((body) => {
        body.athletes = [['Brooks', { sport: 'golf', rank: 1 }]];
      })
    ),
    TAGS.PROVIDED_NEW_FIELD
  );
});
