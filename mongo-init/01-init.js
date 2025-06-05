db = db.getSiblingDB('inatel_api');

db.createUser({
  user: 'api_user',
  pwd: 'api_password',
  roles: [
    {
      role: 'readWrite',
      db: 'inatel_api'
    }
  ]
});

db = db.getSiblingDB('inatel_api_test');

db.createUser({
  user: 'api_user_test',
  pwd: 'api_password_test',
  roles: [
    {
      role: 'readWrite',
      db: 'inatel_api_test'
    }
  ]
});

print('Database initialization completed successfully');
