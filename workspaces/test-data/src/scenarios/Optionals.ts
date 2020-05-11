import { Scenario } from '../helpers/Scenario';
import { newBody, newInteraction } from '../helpers/InteractionHelper';
import { TAGS } from '../helpers/TAGS';

Scenario('Nested optionals', ({ AddPath, LearnBaseline, when }) => {
  const exampleBodyBase = {
    name: {
      first: 'Bob',
      last: 'C',
    },
    rivals: ['user1', 'user2', 'user3'],
    stats: {
      rank: 1,
    },
  };

  const interaction = newInteraction('/users/1234/profile', 'GET');
  interaction.withResponseBody(newBody(exampleBodyBase));

  //makes stats empty by default
  const interaction2 = interaction.fork((i) =>
    i.withResponseBody(
      i.responseBody?.fork((body) => {
        delete body.stats;
        delete body.rivals;
      })
    )
  );

  const baseBody = interaction.requestBody;

  AddPath('users', ':userId', 'profile');
  LearnBaseline(interaction, interaction2);

  when(
    'an optional field is omitted',
    interaction.withResponseBody(
      baseBody?.fork((body) => {
        delete body.stats;
      })
    ),
    TAGS.NO_DIFF_EXPECTED
  );

  when(
    'an optional field is provided but the type does not match',
    interaction.withResponseBody(
      baseBody?.fork((body) => {
        body.stats = 'N/A';
      })
    ),
    TAGS.PROVIDED_DIFFERENT_TYPE_TO_KNOWN_FIELD
  );

  when(
    'an optional field is provided but is null',
    interaction.withResponseBody(
      baseBody?.fork((body) => {
        body.stats = null;
      })
    ),
    TAGS.PROVIDED_DIFFERENT_TYPE_TO_KNOWN_FIELD
  );

  when(
    'an optional field is provided but one of its fields is missing',
    interaction.withResponseBody(
      baseBody?.fork((body) => {
        delete body.stats.rank;
      })
    ),
    TAGS.OMMITED_REQUIRED_FIELD
  );

  when(
    'an optional array field is provided but it contains no items',
    interaction.withResponseBody(
      baseBody?.fork((body) => {
        body.rivals = [];
      })
    ),
    TAGS.NO_DIFF_EXPECTED
  );

  when(
    'an optional array field is provided but it has the wrong typed items',
    interaction.withResponseBody(
      baseBody?.fork((body) => {
        body.rivals = [true, true, '123'];
      })
    ),
    TAGS.ARRAY_ITEM_DOES_NOT_MATCH_ASSERTION
  );

  when(
    'an optional array field is provided but it was provided an object',
    interaction.withResponseBody(
      baseBody?.fork((body) => {
        body.rivals = [{ userId: 'alpha' }, { userId: ' beta' }];
      })
    ),
    TAGS.ARRAY_ITEM_DOES_NOT_MATCH_ASSERTION
  );
});
