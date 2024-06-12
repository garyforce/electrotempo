# Charging Demand Dashboard

This repo contains the front and backends of ElectroTempo's EV charging demand
dashboard. See README.md in [/frontend](frontend) and [/backend](backend) for 
notes on running and deploying those parts of the front and backend.

## Development and Deployment

Our application has three pieces: 

1. The client, a React app with code located in [/frontend](frontend)
2. The backend, a Node.js app with code located in [/backend](backend)
3. The database, a PostgreSQL instance, which is managed by Prisma in [/backend](backend)

Refer to each of the subdirectories for development and deployment instructions.

## Running the dev environment

⚠️ The docker dev environment only supports the database currently. ️Refer to the
frontend and backend directories for starting those applications ⚠️

1. Run `docker compose -f docker-compose.dev.yml up`.

## Developer Notes

This repository attempts to use
[git-flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
as a workflow because it is deployed to multiple environments simultaneously.

All feature development should be a branch off of the `development` branch, and
merged back into that branch when completed. `production` is the production
branch.

Before commit `6fabdb0` this was two separate repositories, so be
warned if you ever check out the repository before then: the merged histories
may be out of sync and incompatible.

## Exposing your local application to the internet

For features that require receiving data from the internet, such as AWS SNS notifications and other webhook services, your local needs to be reachable from the outside world. Ngrok is used to expose your local port that is running your application to the outside world.

Running `npm install` would have installed ngrok for you on this project.

Expose your backend application:
```
npm run ngrok
```
Run with static domain:
```
npm run ngrok -- --domain=your-static-domain
```

You may be prompted to create a ngrok account, follow their instructions and create an account on their website. Then run the following command to configure your auth token. Notice that it is prefixed with `npx` since ngrok is installed only on this project, if you installed it globally you don't need it.
```
npx ngrok config add-authtoken your-token-here
```
It is recommended to use a static domain for the backend application, you can setup a static domain with your free ngrok account so you don't need to update your domain on the webhook services every time.
