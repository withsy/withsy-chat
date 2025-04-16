FROM mcr.microsoft.com/devcontainers/base:debian-12

ENV DEBIAN_FRONTEND=noninteractive

SHELL ["/bin/bash", "-c"]

RUN apt update && \
    apt install -y \
    curl
# For ngrok
RUN curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
    | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null \
    && echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
    | sudo tee /etc/apt/sources.list.d/ngrok.list
RUN apt update && \
    apt install -y \
    wget \
    unzip \
    git \
    postgresql-client \
    # To open in a browser on the host
    xdg-utils \
    # For SafeQL
    python3 \
    ngrok \
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
