import Promise from 'bluebird';
import { typeCheck as isType } from 'type-check';
import deap from 'deap';
import lodash from 'lodash';
import request from 'request-promise';
import { config } from '../index';
import * as session from './session';

export function handle(data) {
  return Promise.resolve().then(() => {
    return _handle(data);
  });
}

async function _handle(data = {}) {
  if (!isType('Object', data)) {
    throw new HttpError();
  }
  let { inline_query, callback_query, message } = data;
  if (inline_query) {
    return handleInlineQuery(inline_query);
  } else if (callback_query) {
    return handleCallbackQuery(callback_query);
  } else if (message) {
    return handleMessage(message);
  } else {
    throw new HttpError('Not implemented', 200);
  }
}

async function handleInlineQuery(_data = {}) {
  let { id, from, query, offset } = _data;
  let games = [{
    type: 'game',
    id: Math.floor(Math.random() * 1e9 * 2).toString(16),
    game_short_name: 'trickyfoxy',
    name: 'Tricky Foxy',
    reply_markup: {
      inline_keyboard: [[{
        text: 'Play Tricky Foxy!',
        callback_game: true
      }]]
    }
  }];
  let results = games.filter(game => game.name.toLowerCase().includes(query.toLowerCase()))
    .map(game => {
      game.name = null;
      return game;
    });
  let answerInlineQuery = {
    inline_query_id: id,
    cache_time: 1,
    results
  };
  return sendApiRequest('answerInlineQuery', answerInlineQuery)
}

async function handleCallbackQuery(_data = {}) {
  let { id, from, message, inline_message_id, chat_instance, data, game_short_name } = _data;
  if (game_short_name !== 'trickyfoxy') {
    throw new HttpError('Game not found');
  }
  let sessionInstance = await session.create(_data);
  let answerCallbackQuery = {
    callback_query_id: id,
    text: 'test',
    show_alert: true,
    url: `http://play.alexbelov.xyz/#session=${sessionInstance.sessionId}`
  };
  return sendApiRequest('answerCallbackQuery', answerCallbackQuery);
}

async function handleMessage(_data = {}) {
  let { chat, game_short_name = 'trickyfoxy' } = _data;
  return sendApiRequest('sendGame', {
    chat_id: chat.id,
    game_short_name
  });
}

async function sendApiRequest(method, data) {
  let apiEndpoint = `https://api.telegram.org/bot${config.telegram.secure}/${method}`;
  let options = {
    method: 'POST',
    uri: apiEndpoint,
    body: data,
    json: true
  };
  return request(options);
}