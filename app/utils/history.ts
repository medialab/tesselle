import createHistory from 'history/createHashHistory';

const history = createHistory({
  basename: process.env.basename,
});

export default history;
