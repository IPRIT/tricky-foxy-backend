import Promise from 'bluebird';
import { typeCheck as isType } from 'type-check';
import deap from 'deap';
import lodash from 'lodash';
import request from 'request-promise';
import { config } from '../index';
import { Session } from '../../models';

export function create(_data) {
  let { id, from = {}, message = {}, inline_message_id, chat_instance, data, game_short_name } = _data;
  
  console.log({
    query_id: id,
    from_id: from.id,
    from_first_name: from.first_name,
    from_last_name: from.last_name,
    from_username: from.username,
    message_id: message.message_id,
    inline_message_id,
    chat_instance,
    data,
    game_short_name
  });
  return Session.create({
    query_id: id,
    from_id: from.id,
    from_first_name: from.first_name,
    from_last_name: from.last_name,
    from_username: from.username,
    message_id: message.message_id,
    inline_message_id,
    chat_instance,
    data,
    game_short_name
  });
}