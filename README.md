# Orders Microservice

## Development
1. Clone the repository
2. Install dependencies
3. Create a `.env` file based on `.env.template`
4. Up docker `docker compose up -d`
5. Run Prisma migration `npx prisma migrate dev`
6. Run `npm run start:dev`

## Production
```
docker build -f dockerfile.prod -t orders-microservice .
```