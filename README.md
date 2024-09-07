# Setup development environment

## Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/en/download/)

## Setup

1. Clone the repository
2. Run `docker-compose -f ./infra/docker-compose.dev.yml up -d`
3. Run `yarn` to install dependencies
4. Run `yarn dev` to start the development server
   `Note: During dev server start, you probably see an type error in @votewise/api or @votewise/upload due to script is running out of order. This is due to this issue: https://github.com/lerna/lerna/issues/449`
5. Open [http://localhost:8080](http://localhost:8080) in your browser
