#!/bin/bash
export SERVER_PORT=8080
export JWT_SECRET=your-very-secure-secret-key-change-this-in-production-minimum-256-bits
export DATABASE_URL=jdbc:postgresql://ep-calm-silence-a15zko7l-pooler.ap-southeast-1.aws.neon.tech/neondb?user=neondb_owner&password=npg_5MIwCD4YhSdP&sslmode=require
export SPRING_PROFILES_ACTIVE=dev

java -jar target/namhatta-management-system-1.0.0.jar \
  --server.port=8080 \
  --spring.profiles.active=dev
