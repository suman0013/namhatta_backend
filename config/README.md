# Configuration Files

This directory contains environment configuration files for different deployment environments.

## Files:

- `.env.development` - Development environment configuration
- `.env.production` - Production environment configuration
- `.env.example` - Example environment file with all required variables
- `.env.springboot` - Spring Boot backend configuration

## Note:

The active environment file `.env.local` is kept in the root directory and is loaded by the application at runtime.

## Usage:

Copy `.env.example` to `.env.local` in the root directory and update with your actual values.
