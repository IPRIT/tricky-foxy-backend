import Promise from 'bluebird';
import { typeCheck as isType } from 'type-check';
import deap from 'deap';
import lodash from 'lodash';
import request from 'request-promise';
import { config } from '../../../utils';
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
  let localHighscore = (await Highscore.max('score', {
    where: {
      userId: session.from_id,
      chatId: session.chat_instance
    }
  })) || 0;
  let globalHighscore = (await Highscore.max('score', {
    where: {
      userId: session.from_id
    }
  })) || 0;
  
  return deap.extend(session.get({ plain: true }), {
    localHighscore, globalHighscore
  });
}