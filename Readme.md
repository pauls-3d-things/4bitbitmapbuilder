# ts-react-bloomer-boilerplate

This is my current favorite frontend tech stack.

## Getting started

Install dependencies

    npm install

Then run the dev server

    npm run start

To build with production settings

    npm run build

## THe Stack

- Typescript `^3.5.3`
  - TSLint `^5.9.1`
- React + React DOM `16.2.0`
  - react-hot-loader `^4.12.7` - so developing is fun ;) (you don't need to refresh the browser)
- bulma `^0.6.2` - a CSS framework (layout, widgets, components)
- bloomer `^0.6.5` - React bindings for bulma
- font-awesome `^4.7.0` - the name speaks for itself
- Webpack `^4.20.2` - to build everything into something deployable
  - node-sass `^4.12.0` - to compile sass to css
  - cssmin `^0.4.3` - to minify the css

## Project Structure

The sources tree is as follows

- `src/`
  - `app/` your app code goes here
  - `style/` for *Sass* built styles
