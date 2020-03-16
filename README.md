[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=PublishEasy/Publisher)](https://dependabot.com)

# Publisher

At the time of writing this is just Emil's pet project to practice software engineering best practices such as clean code and simple design that is flexible, testible, is fit for continuous deployment etc.

The possible future of the project and what the pet project will build towards with no promise of completion at the moment though is:

- A complete CMS for online newspapers / academic journals that publish their articles in issues as opposed to constant stream updating such as big newspapers do. 
- This means that the domain is based on objects such as Authors, Articles, and Issues.
- The core features would be the ability to create, modify and delete Authors, Articles and Issues, with Issues being composed of several articles and probably split into categories and the articles ordered within the categories (to facilitate decisions about where on the newspaper website the articles should show and in what order)
- Another core feature would be providing a strong GraphQL API that a front-end would be able to depend on.
- Finally it would provide a flexible, light-weight, unopinionated API for the front-end to query that data
- The expected usage would be something like:
  - Install this as an npm package
  - Import `publisher/data-fetching` in your clientside script and build it with webpack or something similar and integrate the functions with your views
  - Create a database
  - Run `npx publisher migrate`
  - Run `npx publisher start`
  - You should basically be setup! `npx publisher start` should both serve the CMS at an admin url and your clientside script at the main urls
 
Or something along those lines. Details to be ironed out!

## Possible advanced features
- Granular authorization in the CMS with a workflow of authors (and maybe the public too) pitching articles, editors accepting them, authors writing articles in the CMS, requesting review, getting suggestions and comments from editors, addressing the comments, and getting it approved before editors can then put it into the issue etc. This could also include Google Docs style live collaboration
- A style guide "linter", that would maybe even auto fix based on a style guide you can specify. Would be like an eslint configuration but for English, so things like "We use oxford comma", we always write "NYU", not "New York University". We use "Climate Emergency", not "Climate Change" or "Global Warming". This would then be integrated into the article editor.
- Supporting several types of login, native, Google etc.

## Developer Experience

I want to strive for extremely nice developer experience with minimum setup. Especially also because in the future I may be working with a team of student developers (I may use this to replace thegazelle.org's current setup and CMS which I originally built when I was a student)

## For Christophe

The main parts of real code right now is in the config folder where I implemented some linting rules and a very nicely composed Webpack config (I have never seen such a readable Webpack config haha)


## Unclear elements

> NOTE: This to be expanded upon, but as a rule if this list ever becomes bigger than say 5 main points it means we should simplify the setup and structures. Most things should be self-evident

- Some config in top level directory as it has to be, the rest in config/
- testing-library peer dependency
