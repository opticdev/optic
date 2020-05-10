import { Scenario } from '../helpers/Scenario';
import { newBody, newInteraction } from '../helpers/InteractionHelper';
// @ts-ignore
const { expect } = global;

test('Scenario path can be created', () => {
  const result = Scenario('GET /user/:userId/profile', ({ AddPath }) => {
    AddPath('user', ':userId', 'profile');
  });

  expect(result.commands).toHaveLength(3);
});

test('Baseline Interactions can be created', () => {
  const result = Scenario(
    'GET /user/:userId/profile',
    ({ AddPath, LearnBaseline }) => {
      AddPath('user', ':userId', 'profile');

      const interaction1 = newInteraction('/user/abc/profile', 'GET');
      interaction1.withResponseBody(newBody({ name: 'Aidan', age: 26 }));

      const interaction2 = interaction1.fork((a) => {
        a.withResponseBody(
          a.responseBody?.fork((i) => {
            i.name = 'Dev';
            delete i.age;
          })
        );
      });

      LearnBaseline(interaction1, interaction2);
    }
  );

  expect(result.commands).toHaveLength(13);
  expect(result.events).toHaveLength(18);
});

test('Multiple cases can be created', () => {
  const result = Scenario(
    'GET /user/:userId/profile',
    ({ AddPath, LearnBaseline, when }) => {
      AddPath('user', ':userId', 'profile');

      const interaction1 = newInteraction('/user/abc/profile', 'GET');
      interaction1.withResponseBody(newBody({ name: 'Aidan', age: 26 }));

      LearnBaseline(interaction1);

      when(
        'name is missing',
        interaction1.fork((i) => {
          i.withResponseBody(
            i.responseBody?.fork((body) => {
              delete body.name;
            })
          );
        })
      );

      when(
        'name age missing',
        interaction1.fork((i) => {
          i.withResponseBody(
            i.responseBody?.fork((body) => {
              delete body.age;
            })
          );
        })
      );
    }
  );
  expect(result.scenarios).toHaveLength(2);
});

test('Body can be forked', () => {
  const original = newBody({ name: 'Aidan' });
  const changed = original.fork((a) => {
    a.name = 'Dev';
  });

  expect(original.value.name).not.toBe(changed.value.name);
});

test('Interaction can be forked', () => {
  const original = newInteraction('/user/123/profile', 'GET');
  const changed = original.fork((a) => {
    a.withUrl('/user/235/profile');
  });

  expect(original.url).not.toBe(changed.url);
});
