import Sequelize from 'sequelize';
import sequelize from '../sequelize';
import crypto from 'crypto';

function RandomBytes(length = 16) {
  return () => crypto.randomBytes(length).toString('hex')
}

let Session = sequelize.define('Session', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: Sequelize.STRING,
    unique: true,
    defaultValue: RandomBytes(12)
  },
  query_id: {
    type: Sequelize.STRING
  },
  from_id: {
    type: Sequelize.INTEGER
  },
  from_first_name: {
    type: Sequelize.STRING
  },
  from_last_name: {
    type: Sequelize.STRING
  },
  from_username: {
    type: Sequelize.STRING,
    defaultValue: ''
  },
  message_id: {
    type: Sequelize.INTEGER
  },
  inline_message_id: {
    type: Sequelize.STRING
  },
  chat_instance: {
    type: Sequelize.STRING
  },
  data: {
    type: Sequelize.STRING
  },
  game_short_name: {
    type: Sequelize.STRING
  }
}, {
  engine: 'MYISAM',
  indexes: [{
    name: 'session_id_index',
    fields: [ 'sessionId' ]
  }, {
    name: 'user_id_index',
    fields: [ 'from_id' ]
  }, {
    name: 'chat_id_index',
    fields: [ 'chat_instance' ]
  }]
});

export default Session;