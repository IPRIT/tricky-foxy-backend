import Promise from 'bluebird';
import { typeCheck as isType } from 'type-check';
import deap from 'deap';
import lodash from 'lodash';
import request from 'request-promise';
import { config } from '../index';

export function handle(data) {
  return Promise.resolve().then(() => {
    return _handle(data);
  });
}

async function _handle(data = {}) {
  if (!isType('Object', data)) {
    throw new HttpError();
  }
  let { inline_query, callback_query } = data;
  if (inline_query) {
    return handleInlineQuery(inline_query);
  } else if (callback_query) {
    return handleCallbackQuery(callback_query);
  }
}

async function handleInlineQuery(data) {
  let { id, from, query, offset } = data;
  let games = [{
    type: 'game',
    id: Math.floor(Math.random() * 1e9 * 2).toString(16),
    game_short_name: 'trickyfoxy',
    name: 'Tricky Foxy',
    reply_markup: [[{
      text: 'Play Tricky Foxy!'
    }]]
  }];
  let results = games.filter(game => game.name.includes(query))
    .map(game => {
      game.name = null;
      return game;
    });
  let answerInlineQuery = {
    inline_query_id: id,
    cache_time: 3600,
    results
  };
  return sendApiRequest('answerInlineQuery', answerInlineQuery)
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