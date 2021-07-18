# GiG Tech challenge

## Deploy

### Start broadcaster in development mode

- Run `cp config/.env.local.example config/.env.local` to create you local config file.
- Run `npm install` to install all the necessary dependencies.
- Run `start:dev:broadcaster` to test locally.

### Start listener in development mode

- Run `cp config/.env.local.example config/.env.local` to create you local config file.
- Run `npm install` to install all the necessary dependencies.
- Run `start:dev:listener` to test locally.

### To test the whole project in locally

- Run `cp config/.env.local.example config/.env.local` to create you local config file.
- Run `npm install` to install all the necessary dependencies.
- Run `npm run start:dev` to test locally.

### To test the whole project in product mode

- Run `cp config/.env.product.example config/.env.product` to create you product config file.
- Run `npm install` to install all the necessary dependencies.
- Run `npm run build` to build the project.
- Run `npm run start:prod` to start.

### To Run tests

- Run `cp config/.env.local.example config/.env.local` to create you local config file.
- Run `npm install` to install all the necessary dependencies.
- Run `npm run test` to run tests.

### Start project in docker mode

- Run `npm run build` to build the project.
- Run ` sudo docker-compose -f docker/docker-compose.yml up` to start the containers.
