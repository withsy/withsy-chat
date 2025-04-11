FROM mcr.microsoft.com/devcontainers/base:debian-12

ENV DEBIAN_FRONTEND=noninteractive

SHELL ["/bin/bash", "-c"]

RUN apt update && \
    apt install -y \
    curl \
    wget \
    unzip \
    git \
    postgresql-client \
    # To open in a browser on the host
    xdg-utils \
    # For SafeQL
    python3 \
    && apt clean && \
    rm -rf "/var/lib/apt/lists/*"

# User Scope
USER vscode
ENV HOME="/home/vscode"
RUN echo '' >> ~/.bashrc && \
    echo '################################################################################' >> ~/.bashrc && \
    echo '# Environment variables' >> ~/.bashrc && \
    echo '################################################################################' >> ~/.bashrc && \
    echo '' >> ~/.bashrc

# JavaScript Runtime
RUN echo '# JavaScript' >> ~/.bashrc && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash && \
    bash -i -c 'nvm install 22 && nvm use 22' && \
    echo '' >> ~/.bashrc

# Aliases
RUN echo '# Aliases' >> ~/.bashrc && \
    echo 'alias ll="ls -alhF --color=auto"' >> ~/.bashrc && \
    echo '' >> ~/.bashrc

WORKDIR /work
