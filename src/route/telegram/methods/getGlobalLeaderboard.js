import Sequelize from 'sequelize';
import { Session, Highscore } from '../../../models';

let cache = {};
let lastUpdate;
let cacheTimeout = 1000 * 60;

export default (req, res, next) => {
  let { query } = req;
  handle(query).then(result => {
    res.json(result);
  }).catch(next);
}

async function handle(_data) {
  let { session = '' } = _data;
  if (!session) {
    throw new HttpError('Session does not exist');
  }
  let curTime = new Date();
  if (lastUpdate && curTime.getTime() - lastUpdate.getTime() < cacheTimeout) {
    return {
      lastUpdate: lastUpdate.getTime(),
      scores: cache
    };
  }
  let scores = await Session.findAll({
    attributes: [
      ['from_id', 'id'],
      ['from_first_name', 'first_name'],
      ['from_last_name', 'last_name'],
      ['from_username', 'username'],
      [Sequelize.fn('max', Sequelize.col('Highscores.score')), 'score']
    ],
    include: [{
      model: Highscore,
      required: true,
      attributes: []
    }],
    group: [ 'Highscores.userId' ],
    order: [ [ Highscore, 'score', 'DESC' ] ]
  });
  scores = scores.map(score => score.get({plain: true})).sort((a, b) => b.score - a.score);
  lastUpdate = new Date();
  cache = scores.slice(0, 500);
  return {
    lastUpdate: lastUpdate.getTime(),
    scores: cache
  };
}
