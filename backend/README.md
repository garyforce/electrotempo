# Charging Demand Dashboard Backend

This directory contains the backend layer of the charging demand dashboard.

## Setup

1. Run `npm install`
2. Create `.env` from `.env.example` to match your preferred configuration.

## Running the backend

1. Execute `npm run start` from the command line.

## Database

Our database is managed by [Prisma](https://www.prisma.io/). Refer to Prisma's 
documentation for information on how to use it, including migrations and seeding.

To get started, run `npx prisma migrate reset` to initialize and seed your database.

## Development Notes

The backend routes system is undergoing a structure change. Previously, all 
logic was contained within the associated `*.route.js` files. The route, 
controller, and service layers are being abstracted out for some routes, in 
order to create a more flexible system and to reduce duplicated code across
the backend. Files under `app/controllers` and `app/services` have been 
converted into this new format. Use them as a reference when adding any new 
routes or when refactoring existing routes.