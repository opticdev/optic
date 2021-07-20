import React from 'react';
import { MuiThemeProvider } from './Roadmap';
import Layout from '@theme/Layout';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Container,
  Divider,
  Grid,
  Link,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { SubtleBlueBackground } from '../components/theme';
import { UseCaseCard } from '../components/UseCaseCard';

// Logos
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import {
  faClock,
  faCode,
  faFileAlt,
  faPen,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BrowserOnly from '@docusaurus/core/lib/client/exports/BrowserOnly';

library.add(fab, faCode, faFileAlt, faPen, faClock);

const useStyles = makeStyles((theme) => ({
  root: {
    height: 400,
    backgroundColor: SubtleBlueBackground,
    paddingTop: 15,
    borderBottom: '1px solid #e2e2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  section: {
    marginTop: 50,
    marginBottom: 100,
  },
  heading: {
    fontFamily: 'Ubuntu',
    fontWeight: 700,
    fontSize: 25,
  },
}));

// Links outside of Optic
const externalLinks = {
  discord: {
    href: 'https://discord.gg/t9hADkuYjP',
    logo: <FontAwesomeIcon icon={['fab', 'discord']} />,
  },
  roadmap: {
    href: '/roadmap',
    logo: <FontAwesomeIcon icon={['fab', 'discord']} />,
  },
  githubDiscussions: {
    href: 'https://github.com/opticdev/optic/discussions',
    logo: <FontAwesomeIcon icon={['fab', 'github']} />,
  },
  officeHoursCalendly: {
    href: 'https://calendly.com/opticlabs/maintainer-office-hours',
    logo: <FontAwesomeIcon icon="clock" />,
  },
  onboardingCalendly: {
    href: 'https://calendly.com/optic-onboarding/demo',
    logo: <FontAwesomeIcon icon="clock" />,
  },
};

export default function () {
  const classes = useStyles();
  const signpostGridSize = 6;
  const emailFounders = (
    <Link href="mailto:founders@useoptic.com">founders@useoptic.com</Link>
  );
  return (
    <BrowserOnly
      children={() => (
        <MuiThemeProvider>
          <Layout title="Community">
            <Container maxWidth={false} className={classes.root}>
              <Grid container className={classes.root} spacing={0}>
                <Grid item xs={6}>
                  <Typography variant="h1" className={classes.heading}>
                    Welcome to the Optic Community
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    style={{ lineHeight: 1.6, marginTop: 10 }}
                  >
                    Find help, share resources and help build the next
                    generation of API tools
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <img src="/img/optic-spaceship.svg" />
                </Grid>
              </Grid>
            </Container>

            {/*
          SIGNPOSTS
        */}

            <Container maxWidth={'md'} className={classes.section}>
              <Divider style={{ marginTop: 20, marginBottom: 30 }} />

              <Grid container spacing={4}>
                <Grid item xs={12} sm={signpostGridSize}>
                  <UseCaseCard
                    link={externalLinks.discord.href}
                    title={'**Discord**'}
                    description={
                      'Come talk to our community, the contributors, and the maintainers about Optic and all things APIs'
                    }
                    logo={externalLinks.discord.logo}
                  />
                </Grid>
                <Grid item xs={12} sm={signpostGridSize}>
                  <UseCaseCard
                    link={'/docs'}
                    title={'**Docs**'}
                    description={
                      "Learn about Optic's use cases, workflows and CLI"
                    }
                    logo={<FontAwesomeIcon icon={'file-alt'} />}
                  />
                </Grid>
                <Grid item xs={12} sm={signpostGridSize}>
                  <UseCaseCard
                    link={'/roadmap'}
                    title={'**Feature Request**'}
                    description={
                      'Got a feature you think would be great within Optic, submit it and see if it ends up part of the roadmap.'
                    }
                    logo={<FontAwesomeIcon icon={'pen'} />}
                  />
                </Grid>
                <Grid item xs={12} sm={signpostGridSize}>
                  <UseCaseCard
                    link={externalLinks.officeHoursCalendly.href}
                    title={'**Office Hours**'}
                    description={
                      'The Optic Maintainers hold office hours regularly to listen to help contributors, listen to feature requests and help debug issues. Drop in no advanced notice needed!'
                    }
                    logo={externalLinks.officeHoursCalendly.logo}
                  />
                </Grid>
              </Grid>
            </Container>

            <Container maxWidth={'md'} className={classes.section}>
              <Typography
                variant="h2"
                className={classes.heading}
                style={{ textAlign: 'center', fontSize: 30 }}
              >
                Get involved
              </Typography>

              <Divider style={{ marginTop: 20, marginBottom: 30 }} />

              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="level1-content"
                      id="level1-header"
                    >
                      <Typography>👍 &nbsp; Send some Encouragement</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div styles={'display: block'}>
                        <div>
                          <p>
                            This is a big project, and we love hearing from
                            people in the community. When we get high fives,
                            shoutouts and see people sharing the project it
                            gives the team a lot of energy.
                            <Link href="https://twitter.com/intent/tweet?via=useoptic">
                              a short Tweet
                            </Link>{' '}
                            or email ({emailFounders}).
                          </p>
                        </div>
                        <div>
                          <ul>
                            <li>
                              <Link href="https://github.com/opticdev/optic/stargazers">
                                GitHub Stars feel great
                              </Link>
                            </li>
                            <li>
                              <Link href="https://twitter.com/useoptic">
                                Twitter follows are fun
                              </Link>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <p>
                            It's amazing to know more and more people are using
                            and appreciating the work being put in.
                          </p>
                        </div>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="level2-content"
                      id="level2-header"
                    >
                      <Typography>✍️ &nbsp; Have any feedback?</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div>
                        <p>
                          The more quality feedback we receive, the faster Optic
                          improves. We'd love to have your feedback. Come chat
                          on{' '}
                          <Link href={externalLinks.discord.href}>Discord</Link>
                          ,{' '}
                          <Link href={externalLinks.officeHoursCalendly.href}>
                            drop in on our Maintainer Office Hours
                          </Link>{' '}
                          or add feedback to our{' '}
                          <Link href={externalLinks.roadmap.href}>
                            Public Roadmap
                          </Link>
                          .
                        </p>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="level3-content"
                      id="level3-header"
                    >
                      <Typography>🏁 &nbsp; Use Optic at Work</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div styles={'display: block'}>
                        <p>
                          Every API should use something like Optic for
                          automated documentation and testing. Whether you work
                          at a startup or a large company, the more teams that
                          use Optic, the better.
                        </p>
                        <p>
                          We can help you get set-up and answer your questions
                          with a 30 minute on-boarding call. You can book it
                          really quickly at{' '}
                          <Link href={externalLinks.onboardingCalendly.href}>
                            {externalLinks.onboardingCalendly.href}
                          </Link>{' '}
                          and invite a colleague 😊
                        </p>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="level4-content"
                      id="level4-header"
                    >
                      <Typography>🎨 &nbsp; Publish Content</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div styles={'display: block'}>
                        <p>
                          Help spread the word and build the community by
                          creating some Optic content. Our team will help you
                          promote it and send you some thank you Optic swag.
                        </p>
                        <p>Examples of Content:</p>
                        <ul>
                          <li>Blog Post</li>
                          <li>
                            <Link href="https://twitter.com/intent/tweet?via=useoptic">
                              Tweet or TweetStorm
                            </Link>
                          </li>
                          <li>Make a tutorial post or video</li>
                          <li>
                            Improve the Optic docs (maybe even the page you're
                            reading right now)
                          </li>
                          <li>
                            Create boilerplate projects to help people get
                            started faster ie Express with Optic, or Rails w/
                            Optic
                          </li>
                        </ul>
                        <p>
                          Email us {emailFounders} before publishing so we know
                          to share your content.{' '}
                        </p>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="level5-content"
                      id="level5-header"
                    >
                      <Typography>⌨️ &nbsp; Contribute Code</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div>
                        <p>
                          Optic is open source and you can see all our code on{' '}
                          <Link href="https://github.com/opticdev/optic">
                            GitHub
                          </Link>{' '}
                          at{' '}
                          <Link href="https://github.com/opticdev/optic">
                            https://github.com/opticdev/optic
                          </Link>
                          . You're more than welcome to get involved:
                        </p>
                        <ul>
                          <li>Fix a bug you find</li>
                          <li>
                            <Link href="https://github.com/opticdev/optic/issues">
                              Open an issue
                            </Link>
                          </li>
                          <li>
                            Check our{' '}
                            <Link href="https://github.com/opticdev/optic/issues">
                              open issues
                            </Link>{' '}
                            and talk to us at {emailFounders} about working on
                            them.
                          </li>
                        </ul>
                        <p>
                          <strong>
                            Do you know a lot about managing open source
                            projects?
                          </strong>{' '}
                          As you can see our{' '}
                          <Link href="https://github.com/opticdev/optic/blob/develop/Contributing.md">
                            contributor guides are still nascent.
                          </Link>
                          We would love to chat and learn everything we can
                          about building a great open source community.
                        </p>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="level6-content"
                      id="level6-header"
                    >
                      <Typography>🍀 &nbsp; Join the Team</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div>
                        <p>
                          Like Optic and want to work full time on it? We're
                          hiring people to help us make Optic even better,
                          checkout <Link href="/careers">our careers</Link> page
                          with details on the roles and about working here.
                        </p>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>
            </Container>

            {/*/!**/}
            {/*FAQ*/}
            {/**!/*/}
            {/*<Container maxWidth={'md'} className={classes.section}>*/}
            {/*  <Typography*/}
            {/*    variant="h2"*/}
            {/*    className={classes.heading}*/}
            {/*    style={{ textAlign: 'center', fontSize: 30 }}*/}
            {/*  >*/}
            {/*    What do people commonly ask about Optic?*/}
            {/*  </Typography>*/}

            {/*  <Divider style={{ marginTop: 20, marginBottom: 30 }} />*/}

            {/*  <Typography variant="subtitle1">*/}
            {/*    We get a lot of questions via{' '}*/}
            {/*    <Link href={externalLinks.discord.link}>Discord</Link>,{' '}*/}
            {/*    <Link href="https://github.com/opticdev">GitHub</Link>, or even just*/}
            {/*    chatting{' '}*/}
            {/*    <Link href={externalLinks.officeHoursCalendly.href}>*/}
            {/*      just chatting to us*/}
            {/*    </Link>*/}
            {/*    , so we thought it'd be a good idea to answer some here.*/}
            {/*  </Typography>*/}

            {/*  <div>*/}
            {/*    <Typography variant="h3" className={classes.heading}>*/}
            {/*      How can I share the documentation I generate?*/}
            {/*    </Typography>*/}
            {/*    <ul>*/}
            {/*      <li>*/}
            {/*        <Link href="/share">Quick and easy: our share feature</Link>*/}
            {/*      </li>*/}
            {/*      <li>*/}
            {/*        <Link href="/share/openapi">*/}
            {/*          <code>generate:oas</code>/<code>scripts</code> to export to an*/}
            {/*          existing system*/}
            {/*        </Link>*/}
            {/*      </li>*/}
            {/*    </ul>*/}
            {/*  </div>*/}

            {/*  <div>*/}
            {/*    <Typography variant="h3" className={classes.heading}>*/}
            {/*      Do you support (x development/infrastructure)?*/}
            {/*    </Typography>*/}
            {/*    <p>Simple answer, Yes!</p>*/}
            {/*    <ul>*/}
            {/*      <li>*/}
            {/*        <Link href="/capture">*/}
            {/*          For languages, we have SDKs (a great way to contribute)*/}
            {/*        </Link>*/}
            {/*      </li>*/}
            {/*      <li>*/}
            {/*        <Link href="/capture">*/}
            {/*          We can also integrate with live environments, such as staging,*/}
            {/*          to capture traffic*/}
            {/*        </Link>*/}
            {/*      </li>*/}
            {/*      <li>*/}
            {/*        <Link href="/capture">*/}
            {/*          The local CLI also has a proxy that you can use to monitor*/}
            {/*          your local project or intercept traffic to a remote project*/}
            {/*        </Link>*/}
            {/*      </li>*/}
            {/*    </ul>*/}
            {/*  </div>*/}

            {/*  <div>*/}
            {/*    <Typography variant="h3" className={classes.heading}>*/}
            {/*      I ran into something weird when documenting an edge case in my*/}
            {/*      API. Can you take a look at it?*/}
            {/*    </Typography>*/}
            {/*    <ul>*/}
            {/*      <li>*/}
            {/*        <Link href="/reference/optic-cli/commands/debug">*/}
            {/*          generate a debug dump from CLI*/}
            {/*        </Link>*/}
            {/*      </li>*/}
            {/*    </ul>*/}
            {/*  </div>*/}

            {/*  <div>*/}
            {/*    <Typography variant="h3" className={classes.heading}>*/}
            {/*      How do I get started?*/}
            {/*    </Typography>*/}
            {/*    <ul>*/}
            {/*      <li>*/}
            {/*        <Link href="/document">*/}
            {/*          Docs: install, integrate, capture traffic, bulk add to*/}
            {/*          establish your baseline*/}
            {/*        </Link>*/}
            {/*      </li>*/}
            {/*      <li>*/}
            {/*        <Link href="/change">*/}
            {/*          As you monitor more traffic, Optic will report differences*/}
            {/*        </Link>*/}
            {/*      </li>*/}
            {/*    </ul>*/}
            {/*  </div>*/}

            {/*  <div>*/}
            {/*    <Typography variant="h3" className={classes.heading}>*/}
            {/*      Is this free? Will it cost money?*/}
            {/*    </Typography>*/}
            {/*    <ul>*/}
            {/*      <li>*/}
            {/*        <Link href="/reference#under-the-hood">*/}
            {/*          Optic is free and open source*/}
            {/*        </Link>*/}
            {/*        . We have a [cloud offering](BETA LINK) that lets you collect*/}
            {/*        traffic from your deployed environments*/}
            {/*      </li>*/}
            {/*    </ul>*/}
            {/*  </div>*/}

            {/*  <div>*/}
            {/*    <Typography variant="h3" className={classes.heading}>*/}
            {/*      Does this work for all APIS*/}
            {/*    </Typography>*/}
            {/*    <ul>*/}
            {/*      <li>*/}
            {/*        Today we support REST. GraphQL and Protos are on the{' '}*/}
            {/*        <Link href="/roadmap">roadmap</Link> but they aren’t coming soon*/}
            {/*      </li>*/}
            {/*    </ul>*/}
            {/*  </div>*/}
            {/*</Container>*/}

            {/*
        INTERESTED IN APIs
        */}

            <Container maxWidth={'md'} className={classes.section}>
              <Typography
                variant="h2"
                className={classes.heading}
                style={{ textAlign: 'center', fontSize: 30 }}
              >
                More API Content
              </Typography>

              <Divider style={{ marginTop: 20, marginBottom: 30 }} />

              <Grid container spacing={4}>
                <Grid item xs={12} sm={8}>
                  <Typography variant="subtitle1">
                    Check out the Optic{' '}
                    <Link href="https://useoptic.com/blog">Blog</Link> where we
                    discuss building better APIs. And out in the wild you can
                    listen to our very own{' '}
                    <Link href="https://twitter.com/aidandcunniffe">
                      Aidan Cunniffe,
                    </Link>{' '}
                    <Link href="https://twitter.com/kinlane">Kin Lane</Link> and{' '}
                    <Link href="https://twitter.com/mamund">Mike Amundsen</Link>{' '}
                    on API Storytelling. You can catch watch the video cast on{' '}
                    <Link href="https://www.youtube.com/channel/UChLC45yh9DTkerV-TSJJo3A/featured">
                      YouTube
                    </Link>
                    , or listen to the podcast at{' '}
                    <Link href="https://anchor.fm/api-storytelling">
                      https://anchor.fm/api-storytelling
                    </Link>
                    .
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <img src="https://s3-us-west-2.amazonaws.com/anchor-generated-image-bank/production/podcast_uploaded400/15633871/15633871-1623593067716-39a739b0c116d.jpg" />
                </Grid>
              </Grid>
            </Container>
          </Layout>
        </MuiThemeProvider>
      )}
    />
  );
}
