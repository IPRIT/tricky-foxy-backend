import Promise from 'bluebird';
import { typeCheck as isType } from 'type-check';
import deap from 'deap';
import lodash from 'lodash';
import request from 'request-promise';
import { config } from '../../../utils';
import Sequelize from 'sequelize';
import { Session, Highscore } from '../../../models';

export default (req, res, next) => {
  let { query } = req;
  handle(query).then(result => {
    res.json(result);
  }).catch(next);
}

async function handle(_data) {
  let { session = '' } = _data;
  let sessionInstance = await Session.findOne({
    where: {
      sessionId: session
    }
  });
  if (!sessionInstance) {
    throw new HttpError('Session not found');
  }
  let chatId = sessionInstance.chat_instance;
  
  return Session.findAll({
    attributes: [
      ['from_id', 'id'],
      ['from_first_name', 'first_name'],
      ['from_last_name', 'last_name'],
      ['from_username', 'username'],
      [Sequelize.fn('max', Sequelize.col('Highscores.score')), 'score']
    ],
    where: {
      chat_instance: chatId
    },
    include: [{
      model: Highscore,
      required: true,
      attributes: []
    }],
    group: [ 'Highscores.userId' ],
    order: [ 'score', 'DESC' ]
  });
}