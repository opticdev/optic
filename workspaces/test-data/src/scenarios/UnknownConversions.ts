import { Scenario } from '../helpers/Scenario';
import { newBody, newInteraction } from '../helpers/InteractionHelper';
import { TAGS } from '../helpers/TAGS';

Scenario(
  'Unknowns diffed against real values',
  ({ AddPath, LearnBaseline, when }) => {
    const exampleBodyBase = {
      nullable: null,
      emptyArray: [],
    };

    const interaction = newInteraction('/unknown', 'GET');
    interaction.withResponseBody(newBody(exampleBodyBase));

    const baseBody = interaction.requestBody;

    AddPath('unknown');
    LearnBaseline(interaction);

    when(
      'a nullable[unknown] is provided with a concrete type',
      interaction.withResponseBody(
        baseBody?.fork((body) => {
          body.nullable = 'nullable string';
        })
      ),
      TAGS.UNKNOWN_NULLABLE_PROVIDED_WITH_VALUE
    );

    when(
      'a list[unknown] is provided with concrete types',
      interaction.withResponseBody(
        baseBody?.fork((body) => {
          body.emptyArray = [1, 2, 3, 4, 5];
        })
      ),
      TAGS.UNKNOWN_LIST_PROVIDED_WITH_ITEMS
    );
  }
);

Scenario(
  'Unknowns arrays, with complex types',
  ({ AddPath, LearnBaseline, when }) => {
    const exampleBodyBase = {
      users: [],
    };

    const interaction = newInteraction('/users', 'GET');
    interaction.withResponseBody(newBody(exampleBodyBase));

    const baseBody = interaction.requestBody;

    AddPath('users');
    LearnBaseline(interaction);

    when(
      'when unknown replaced by an object',
      interaction.withResponseBody(
        baseBody?.fork((body) => {
          body.users = [{ name: 'Bob' }, { name: 'Tim' }, { name: 'Mary' }];
        })
      ),
      TAGS.UNKNOWN_NULLABLE_PROVIDED_WITH_VALUE
    );

    when(
      'when unknown replaced by an object with optional fields',
      interaction.withResponseBody(
        baseBody?.fork((body) => {
          body.users = [
            { name: 'Bob' },
            { name: 'Tim', age: 12 },
            { name: 'Mary' },
          ];
        })
      ),
      TAGS.UNKNOWN_NULLABLE_PROVIDED_WITH_VALUE
    );

    when(
      'when unknown replaced by one of list items',
      interaction.withResponseBody(
        baseBody?.fork((body) => {
          body.users = [12, 'ABC', false];
        })
      ),
      TAGS.UNKNOWN_NULLABLE_PROVIDED_WITH_VALUE
    );

    when(
      'when unknown replaced by possible null item (first item)',
      interaction.withResponseBody(
        baseBody?.fork((body) => {
          body.users = [null, { name: 'Tim' }, { name: 'Mary' }];
        })
      ),
      TAGS.UNKNOWN_NULLABLE_PROVIDED_WITH_VALUE
    );

    when(
      'when unknown replaced by possible null item (last item)',
      interaction.withResponseBody(
        baseBody?.fork((body) => {
          body.users = [{ name: 'Tim' }, { name: 'Mary' }, null];
        })
      ),
      TAGS.UNKNOWN_NULLABLE_PROVIDED_WITH_VALUE
    );

    when(
      'when unknown replaced by array of tuples',
      interaction.withResponseBody(
        baseBody?.fork((body) => {
          body.users = [
            ['aidan', 767834],
            ['bob', 653737],
            ['charles', 293737],
          ];
        })
      ),
      TAGS.UNKNOWN_NULLABLE_PROVIDED_WITH_VALUE
    );
  }
);
