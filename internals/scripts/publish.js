/* eslint-disable no-console */
const ghpages = require('gh-pages');
 
ghpages.publish('build', {dotfiles: true}, (err) => {
  if (err) {
    console.log('An error occured while publishing.');
    console.error(err);
  } else {
    console.log('publication is ok. Checkout https://medialab.github.io/Tesselle');
  }
});
