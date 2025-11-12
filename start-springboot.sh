#!/bin/bash

# Load environment variables from .env.springboot (excluding comments)
export VITE_API_BASE_URL=http://localhost:8080
export DATABASE_URL=jdbc:postgresql://ep-calm-silence-a15zko7l-pooler.ap-southeast-1.aws.neon.tech/namhatta?user=neondb_owner&password=npg_5MIwCD4YhSdP&sslmode=require&channelBinding=require
export JWT_SECRET=42d236149a7fe69b8f2f5ec7093f4805873e6569098cacbdc076eae0f80eef53
export SESSION_SECRET=5fcddc0a4c6ed316629c871d768422995efc66aff8fa0c658c1f0006db3c2351
export NODE_ENV=development
export AUTHENTICATION_ENABLED=true
export VITE_AUTHENTICATION_ENABLED=true

echo "Starting Spring Boot backend on port 8080..."
cd backend-spring
echo "Cleaning previous build..."
mvn clean
echo "Starting application..."
mvn spring-boot:run \
  -Dspring-boot.run.arguments="--spring.profiles.active=dev --spring.datasource.url=jdbc:postgresql://ep-calm-silence-a15zko7l-pooler.ap-southeast-1.aws.neon.tech/namhatta?user=neondb_owner&password=npg_5MIwCD4YhSdP&sslmode=require&channelBinding=require" \
  -Dmaven.test.skip=true
