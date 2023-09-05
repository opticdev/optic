import prompts from 'prompts';
import { OpticBackendClient } from '../client';

function isInteractive() {
  return (
    process.stdout?.isTTY &&
    process.env.TERM !== 'dumb' &&
    !('CI' in process.env)
  );
}

export async function getOrganizationFromToken(
  client: OpticBackendClient,
  message: string
): Promise<
  | {
      ok: true;
      org: { id: string; name: string };
    }
  | {
      ok: false;
      error: string;
    }
> {
  let org: { id: string; name: string };

  const { organizations } = await client.getTokenOrgs();
  if (organizations.length > 1) {
    if (isInteractive()) {
      const response = await prompts(
        {
          type: 'select',
          name: 'orgId',
          message,
          choices: organizations.map((org) => ({
            title: org.name,
            value: org.id,
          })),
        },
        { onCancel: () => process.exit(1) }
      );
      org = organizations.find((o) => o.id === response.orgId)!;
      console.log('');
    } else {
      return {
        ok: false,
        error:
          "Authenticated personal access token can access multiple organizations and Optic didn't know which one was the right one. Use an organization token to disambiguate in non TTY environments.",
      };
    }
  } else if (organizations.length === 0) {
    process.exitCode = 1;
    return {
      ok: false,
      error:
        'Authenticated token was not associated with any organizations. Generate a new token at https://app.useoptic.com',
    };
  } else {
    org = organizations[0];
  }

  return { ok: true, org };
}
