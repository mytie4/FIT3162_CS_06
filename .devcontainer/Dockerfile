FROM mcr.microsoft.com/devcontainers/typescript-node:20

# Install PostgreSQL client for database access from the dev container
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends postgresql-client \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
