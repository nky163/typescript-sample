# Docker Setup for TypeScript Sample Application

This directory contains the necessary files and instructions for setting up the Docker environment for the TypeScript sample application.

## Docker Compose

The `docker-compose.yml` file defines the services required to run the application, including the PostgreSQL database. To start the application and the database, run the following command in the root of the project:

```bash
docker-compose up
```

This command will build the Docker images and start the containers as defined in the `docker-compose.yml` file.

## Database Initialization

The `init/init.sql` file contains SQL commands that will be executed to initialize the database schema. Ensure that this file is correctly set up with the necessary SQL commands to create the required tables and relationships.

## Building the Docker Image

The `Dockerfile` contains the instructions for building the Docker image for the application. You can build the image using the following command:

```bash
docker build -t typescript-sample-app .
```

## Accessing the Application

Once the containers are running, you can access the application at `http://localhost:3000` (or the port specified in your `docker-compose.yml` file).

## Stopping the Application

To stop the application and remove the containers, use the following command:

```bash
docker-compose down
```

This will stop all running containers and remove them, along with any networks created by Docker Compose.