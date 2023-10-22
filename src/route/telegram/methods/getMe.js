import deap from 'deap';
import { config, md5 } from '../../../utils';
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
  let localHighscore = await Highscore.max('score', {
    where: {
      userId: sessionInstance.from_id,
      chatId: sessionInstance.chat_instance
    }
  }) || 0;
  let globalHighscore = await Highscore.max('score', {
    where: {
      userId: sessionInstance.from_id
    }
  }) || 0;
  let _shard = md5(`${sessionInstance.from_id}->${process.env.SALT}`);

  return deap.extend(sessionInstance.get({ plain: true }), {
    localHighscore, globalHighscore, _shard
  });
}
