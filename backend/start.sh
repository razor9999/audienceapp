#!/bin/bash
cd /app/backend
npm install
./node_modules/.bin/sequelize db:migrate
./node_modules/.bin/sequelize db:seed:all

cd /app/backend
npm start

