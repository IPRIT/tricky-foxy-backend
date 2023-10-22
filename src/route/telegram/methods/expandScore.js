import Promise from 'bluebird';
import { typeCheck as isType } from 'type-check';
import deap from 'deap';
import lodash from 'lodash';
import request from 'request-promise';
import { config, md5, telegram } from '../../../utils';
import Sequelize from 'sequelize';
import { Session, Highscore } from '../../../models';
import CryptoJS from 'crypto-js';

export default (req, res, next) => {
  let { body } = req;
  handle(body).then(result => {
    res.json(result);
  }).catch(next);
}

async function handle(_data) {
  let { session = '', hash } = _data;
  let sessionInstance = await Session.findOne({
    where: {
      sessionId: session
    }
  });
  if (!sessionInstance) {
    throw new HttpError('Session not found');
  } else if (sessionInstance.isBanned || await Session.isUserBanned(sessionInstance.from_id)) {
    throw new HttpError();
  }
  let shard = md5(`${sessionInstance.from_id}->${process.env.SALT}`);
  console.log('shard', shard)

  const bytes = CryptoJS.AES.decrypt(hash, shard);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);

  console.log('encryption.decrypt', decrypted)
  let passedIslands = JSON.parse(decrypted.split('').reverse().join(''));
  let score = getScore(passedIslands, sessionInstance);
  let scoreInstance = await saveScore(score, sessionInstance);
  return {
    result: scoreInstance.score
  };
}

function getScore(passedIslands, sessionInstance) {
  if (!isType('Object', passedIslands)) {
    throw new HttpError();
  }
  let block = passedIslands;
  let _prevT = 0;
  let _it = 0;
  let _iterRestrict = 1e6;
  let score = 0;
  do {
    score = getScoreFromBlock(block, sessionInstance, _prevT);
    _prevT = block._t;
    block = block._n;
    ++_it;
  } while (block && _iterRestrict > _it);
  return score;
}

function getScoreFromBlock(block, sessionInstance, prevT) {
  let sessionCreatedAt = sessionInstance.createdAt;
  let { _f, _p, _r, _s, _t } = block || {};

  if (!Array.isArray(_f) || _f.length !== 2) {
    sessionInstance.ban();
    throw new HttpError();
  } else if (_p > 1 || _p < 0) {
    sessionInstance.ban();
    throw new HttpError();
  } else if (_r > 1 || _r < 0) {
    sessionInstance.ban();
    throw new HttpError();
  } else if (new Date(sessionCreatedAt) > new Date(_t) || _t < prevT) {
    sessionInstance.ban();
    throw new HttpError();
  } else if (typeof _s !== 'string') {
    sessionInstance.ban();
    throw new HttpError();
  }
  return parseInt(_s, 20);
}

async function saveScore(score = 0, sessionInstance) {
  if (score > 300) {
    await sessionInstance.ban();
    throw new HttpError();
  }
  score = Math.min(1e5, Math.max(0, score));
  let scoreInstance = await Highscore.create({
    chatId: sessionInstance.chat_instance,
    userId: sessionInstance.from_id,
    sessionId: sessionInstance.id,
    score
  });
  let opts = {
    user_id: sessionInstance.from_id,
    score,
    edit_message: true
  };
  if (sessionInstance.inline_message_id) {
    opts.inline_message_id = sessionInstance.inline_message_id;
  } else {
    opts.chat_id = sessionInstance.chat_id;
    opts.message_id = sessionInstance.message_id;
  }
  try {
    await telegram.sendApiRequest('setGameScore', opts);
  } catch (err) {
    if (err.toString().includes('BOT_SCORE_NOT_MODIFIED')) {
      const { user_id, inline_message_id, chat_id, message_id } = opts;
      const { ok, result } = await telegram.sendApiRequest('getGameHighScores', {
        user_id, inline_message_id, chat_id, message_id
      });

      const [score] = result;

      console.log(result, score, score.user.id, user_id)

      if (ok && score && score.user.id === user_id) {
        await scoreInstance.update({
          score: score.score,
        })
      }
    }
  }
  return scoreInstance;
}
