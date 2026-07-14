# Electricity Project

# Deployment URLs:

- Frontend: https://project-electricity.app/
- Backend: https://api.project-electricity.app

## Setup Guide (local Docker):

1. Navigate to backend
   cd backend

2. How to run docker
   npm run docker:up

3. Docker install (if not)
   https://www.docker.com/products/docker-desktop/

4. NodeJS install (if not)
   https://nodejs.org/en/download

5. install deps:
   npm install

6. Make the schema/mysql tables
   npm run db:schema:apply

7. Populate (seed) the database
   db:seed:apply
