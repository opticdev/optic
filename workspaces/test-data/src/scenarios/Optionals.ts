import { Scenario } from '../helpers/Scenario';
import { newBody, newInteraction } from '../helpers/InteractionHelper';
import { TAGS } from '../helpers/TAGS';

Scenario(
  'Root Shape is an Object with Keys',
  ({ AddPath, LearnBaseline, when }) => {
    const exampleBodyBase = {
      firstName: 'Aidan',
      lastName: 'C',
      age: 26,
      cities: ['San Fransisco', 'New York', 'Durham'],
    };

    const interaction = newInteraction('/users/1234/profile', 'GET');
    interaction.withResponseBody(newBody(exampleBodyBase));

    const baseBody = interaction.requestBody;

    AddPath('users', ':userId', 'profile');
    LearnBaseline(interaction);

    when(
      'a known field is missing',
      interaction.withResponseBody(
        baseBody?.fork((body) => {
          delete body.lastName;
        })
      ),
      TAGS.OMMITED_REQUIRED_FIELD
    );

    when(
      'a known field is provided the wrong shape',
      interaction.withResponseBody(
        baseBody?.fork((body) => {
          body.age = 'Twenty-Six';
        })
      ),
      TAGS.PROVIDED_DIFFERENT_TYPE_TO_KNOWN_FIELD
    );

    when(
      'an extra field is provided',
      interaction.withResponseBody(
        baseBody?.fork((body) => {
          body.favoriteColor = 'Syracuse-Orange';
        })
      ),
      TAGS.PROVIDED_NEW_FIELD
    );

    when(
      'field is array of primitives, and > 1 item does not match expected type',
      interaction.withResponseBody(
        baseBody?.fork((body) => {
          body.cities = [...body.cities, 27707];
        })
      ),
      TAGS.ARRAY_ITEM_DOES_NOT_MATCH_ASSERTION
    );
  }
);

Scenario('Nested Object Keys', ({ AddPath, LearnBaseline, when }) => {
  const exampleBodyBase = {
    location: {
      principality: {
        city: 'San Fransisco',
        population: 830000,
      },
    },
  };

  const interaction = newInteraction('/locations/sf', 'GET');
  interaction.withResponseBody(newBody(exampleBodyBase));

  const interaction2 = interaction.fork((i) => {
    i.withResponseBody(
      i.responseBody?.fork((base) => {
        base.location.coordinates = {
          latitude: '37.7749° N',
          longitude: '122.4194° W',
        };
      })
    );
  });

  const baseBody = interaction.requestBody;

  AddPath('locations', ':code');
  LearnBaseline(interaction, interaction2);

  when(
    'a new field is provided in a required nested object',
    interaction.withResponseBody(
      baseBody?.fork((body) => {
        body.location.principality.motto = 'Experientia Docet';
      })
    ),
    TAGS.PROVIDED_NEW_FIELD
  );

  when(
    'a new field is provided in an optional nested object',
    interaction.withResponseBody(
      baseBody?.fork((body) => {
        body.location.coordinates.format = 'DMS';
      })
    ),
    TAGS.PROVIDED_NEW_FIELD
  );

  when(
    'the wrong value is provided to an optional field',
    interaction.withResponseBody(
      baseBody?.fork((body) => {
        body.location.coordinates = 'N/A';
      })
    ),
    TAGS.PROVIDED_DIFFERENT_TYPE_TO_KNOWN_FIELD
  );
});
