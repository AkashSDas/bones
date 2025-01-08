# Base image for Bridge service
FROM bridge:1.0.0 AS bridge

# Base image for Bridge v2 service
FROM bridge-v2:1.0.0 AS bridge-v2

# Starting with Python image since it's a Python Workspace
FROM python:3.13.0-slim

# ===========================================
# Setup Bridge and workspace utilities
# ===========================================

# Install required dependencies for workspace setup/execution
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx supervisor curl neovim lsof python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy the Nginx and Supervisor configuration files
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./port-8000-80.conf /etc/nginx/conf.d/port-8000-80.conf
COPY ./supervisord.conf /etc/supervisor/supervisord.conf

# Copy Bridge and install Deno (same version as used in Bridge) to run Bridge
COPY --from=bridge /usr/bridge /usr/bridge
COPY --from=denoland/deno:bin-2.0.6 /deno /usr/local/bin/deno

# Copy Bridge v2 and install Node (same version as used in Bridge v2) to run Bridge v2
COPY --from=bridge-v2 /usr/bridge-v2 /usr/bridge-v2
COPY --from=node:20.8.0-bullseye-slim /usr/local/bin/node /usr/local/bin/node

# Exposed ports that user can use for their work
EXPOSE 80
EXPOSE 3000
EXPOSE 3001
EXPOSE 3002
EXPOSE 3002
EXPOSE 4200
EXPOSE 5173
EXPOSE 8000
EXPOSE 8080

# ===========================================
# Setup workspace project
# ===========================================

# python
ENV PYTHONUNBUFFERED=1 \
    # prevents python creating .pyc files
    PYTHONDONTWRITEBYTECODE=1 \
    \
    # pip
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    \
    # poetry
    # https://python-poetry.org/docs/configuration/#using-environment-variables
    POETRY_VERSION=1.8.4 \
    # make poetry install to this location
    POETRY_HOME="/opt/poetry" \
    # make poetry create the virtual environment in the project's root
    # it gets named `.venv`
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    # do not ask any interactive question
    POETRY_NO_INTERACTION=1 \
    \
    # paths
    # this is where our requirements + virtual environment will live
    PYSETUP_PATH="/opt/pysetup" \
    VENV_PATH="/opt/pysetup/.venv"

# prepend poetry and venv to path
ENV PATH="$POETRY_HOME/bin:$VENV_PATH/bin:$PATH"

RUN apt-get update \
    && apt-get install --no-install-recommends -y \
    # deps for installing poetry
    curl \
    # deps for building python deps
    build-essential

# install poetry - respects $POETRY_VERSION & $POETRY_HOME
RUN curl -sSL https://install.python-poetry.org | python -

# copy project requirement files here to ensure they will be cached.
WORKDIR $PYSETUP_PATH
COPY poetry.lock pyproject.toml ./

# install runtime deps - uses $POETRY_VIRTUALENVS_IN_PROJECT internally
RUN poetry install 

# Set the working directory to /usr/workspace
WORKDIR /usr/workspace

# copy current workspace
COPY . .

# quicker install as runtime deps are already installed
RUN poetry install

# ===========================================
# Workspace final image setup
# ===========================================

# Delete unnecessary files
RUN rm ./nginx.conf ./supervisord.conf ./port-8000-80.conf ./bones.Dockerfile ./.dockerignore

# Run Supervisor to manage the services
CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
