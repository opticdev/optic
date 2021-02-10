import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Container from '@material-ui/core/Container';
import { MuiThemeProvider } from '../components/MuiIndexPage';
import { MarkdownRender } from '../components/Markdown';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
const markdown = `
# Join Optic's Team

> We're on a mission to 10x developers and their teams withs great developer tools that make collaboration and bringing software to market easy. Today the mandate is simple: **make API's developer friendly**. It's the first act of a very exciting story.

Optic's open source tools are watching the world's APIs, learning how they behave, and unlocking new workflows that help developers and their teams collaborate better.

Today we're building the Git / GitLab for APIs — open source tools that automatically document, test and track the evolution of the APIs we all depend on daily.

We're backed by Boldstart, YCombinator and the founders of many of the dev tools you use daily.

## The team we are building

We are **big thinkers, but we remain focused on what matters most**.

We have a **healthy** **relationship with reality.** We experiment, we iterate, and we prefer to know the answers — even when they're hard to hear. This is in our DNA; a pivotal part of our founding has been running experiments and not hesitating to change course — even if we have to throw out cool tech.

We **prioritize and invest in the growth of individuals**, trusting the growth of each teammate will enhance our collective capabilities.

We remain patient, value resilience and **make decisions in service to our long-term goals.**

## A culture of product ownership and agency

We are product-minded and user-focused. Many people only see the gearbox. **If you can’t help but see the whole car, the driver, and the road they’re driving on -- you should consider joining Optic**

At Optic you will:
- Work for the users, run experiments, and question everything
- Focus on the jobs users need done, and solving their problems
- Work asynchronously, in collaboration with your peers, towards a common goal



## Benefits

- 💵 **Competitive Salary + Equity Compensation**
- **🩺 Great Health Insurance**
- **📍 Remote & Async Work**
- 🛫 **Generous PTO**
- 📖 **Learning Benefits**
- 🖥 **Home Office Upgrade**


## Values

#### Take Ownership

People are at their most creative and fulfilled when they have agency and undertake meaningful responsibilities. We encourage you to take ownership for your work, the growth of your peers, the decisions your team makes, and the success of the customers you work with.

#### Practice Good Craftsmanship

As toolmakers, we have the privilege of measuring our impact by seeing the results of the products we help create. Do your best work and make sure you are proud of the part of Optic for which you have been given responsibility.

#### Be a Good Human

Treat others with the respect, empathy and compassion every person deserves. Endeavor to leave everyone you interact with better than you found them.

#### Always Learn, Always Teach

Companies are just groups of people, and the surest way to raise our collective game is to focus on our own personal development. Take the time to learn from and to teach those around you. Hours spent reflecting on why something didn't work, researching how to take on the latest challenge, how you can improve, or teaching your teammates something new are never wasted.

#### Be Deliberate, Remain Patient

We're a patient bunch who know that the quality of decisions generally increases the longer the time horizon. Sometimes we have to say no to things that feel good in the moment because they bring us off-course. Practically, thinking long term doesn't mean over-optimizing or building everything to last. Rather it means confronting the nuance and being deliberate about the decisions we make and the tradeoffs they incur.


---

### The roles we are searching for

We see recruiting as an exercise in Tolkien-esq world-building. We are creating our own slice of the universe where the rules are different, the cast of characters tear through challenges, support one another's growth, and lead compelling lives.

We are not hiring engineers, or recruiting a team; we’re building the subset of the world we are proud and eager to spend most of our working hours each day.

`.trim();

const valuesAndBenefits = `

`.trim();

function Careers() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout title={`Join the Team`}>
      <main
        style={{ backgroundColor: '#fafbfc !important', paddingBottom: 360 }}
      >
        <MuiThemeProvider>
          <Container maxWidth="md" fullWidth style={{ marginTop: 50 }}>
            <Typography
              variant="overline"
              color="textSecondary"
              component="div"
              style={{ marginBottom: 10 }}
            >
              An intentionally plain jobs board for a team and product built
              with intention:
            </Typography>
            <MarkdownRender source={markdown} />
            <MarkdownRender
              source={valuesAndBenefits}
              style={{ marginTop: 30 }}
            />

            <Button
              variant="contained"
              size="large"
              color="primary"
              href="https://boards.greenhouse.io/optic/jobs/4001427004"
            >
              View Open Positions
            </Button>
          </Container>
        </MuiThemeProvider>
      </main>
    </Layout>
  );
}

export default Careers;
