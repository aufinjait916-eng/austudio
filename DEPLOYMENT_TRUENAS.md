# TrueNAS SCALE Deployment Guide

This guide describes how to build, run, and host the **Au Design Studio** (React + Express full-stack application) directly inside your **TrueNAS SCALE** environment. 

TrueNAS SCALE provides multiple ways to host containerized apps. We will detail both the standard **TrueNAS App Wizard (Web UI)** approach and the **Docker Compose (Advanced/Dockge)** pipeline.

---

## 📋 Prerequisites
1. **Gemini API Key:** You must have a valid Google Gemini API key from Google AI Studio.
2. **TrueNAS SCALE Instance Hooked up:** TrueNAS SCALE (Cobia 23.10+ or Dragonfish 24.04+ recommended) with an active applications pool configured.
3. **Repository access:** Ensure you have pushed this repository, including the added `Dockerfile` and `docker-compose.yml`, to your personal GitHub account.

---

## 🚀 Step 1: Building your Docker Container Image

Because TrueNAS SCALE fetches pre-assembled container images from registries, you should build and push your custom container image to a registry such as **GitHub Container Registry (GHCR)** or **Docker Hub**.

### Option A: Direct Build & Push via Local Shell
If you have a local machine configured with Docker, run these commands in the root of the source code:

```bash
# 1. Log into your Docker Hub or GitHub Container Registry account
docker login ghcr.io

# 2. Build the production multi-stage static container image
docker build -t ghcr.io/<your-github-username>/au-design-studio:latest .

# 3. Push to registry
docker build --platform linux/amd64 -t ghcr.io/<your-github-username>/au-design-studio:amd64 . --push
```

### Option B: Automatic Build via GitHub Actions
Add a simple workflow file in `.github/workflows/deploy.yml` on your GitHub repository to build on push:
```yaml
name: Build and Release Container

on:
  push:
    branches: [ "main", "master" ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Build and Push Image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:latest
          platforms: linux/amd64
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## 🛠️ Step 2: Deploying to TrueNAS SCALE Apps Board

Once your image is hosted at `ghcr.io/<username>/<repo>:latest` or `docker.io/<username>/<repo>:latest`, log into your TrueNAS SCALE dashboard.

### Through TrueNAS SCALE "Custom App" Panel

1. Go to **Apps** in the main column menu.
2. Click **Discover Apps** on the top right.
3. Choose the **Custom App** button (often labeled **Launch Docker Image**).
4. Fill out the **Configuration form** using the values below:

### 1. Application Name
* **Application Name:** `au-design-studio`

### 2. Container Images (Image Settings)
* **Image Repository:** `ghcr.io/<your-github-username>/au-design-studio` *(e.g., matching your published build path)*
* **Image Tag:** `latest` or `amd64`
* **Image Pull Policy:** `Always` *(this ensures when you pull updates, TrueNAS loads the latest code changes)*

### 3. Container Environment Variables
To get the AI Image SEO phrase generator and backdrop features working, assign your API Key environment variables:
* Click **Add** under Environment Variables:
  * **Name (Key):** `GEMINI_API_KEY`
  * **Value:** `<YOUR_GEMINI_API_KEY_HERE>`
* Add another (optional) variable:
  * **Name (Key):** `NODE_ENV`
  * **Value:** `production`

### 4. Port Forwarding / Network Settings
Configure where your applet binds:
* Click **Add** under Port Forwarding Settings:
  * **Container Port:** `3000` *(Must be 3000 as configured in the server)*
  * **Node Port / Host Port:** Match it to `3000` (or another unused port on your TrueNAS e.g., `8340`)
  * **Protocol:** `TCP`

### 5. Storage (Optional)
This app is stateless and processes local operations on-the-fly, so you do not need to configure any custom SMB/NFS path volumes or persistent host paths.

### 6. Save & Deploy
* Review the settings, click **Save** at the bottom of the screen.
* Wait 1–2 minutes while TrueNAS SCALE downloads the image layer and initializes the container. 
* Review the active status. Once it shows `Active (Stable)`, your backend server is live!

---

## 🐳 Web-UI Access & Verification

Verify the server is functioning by opening the following address in your web browser:
```text
http://<your-truenas-ip-address>:3000
```

To watch performance and API operations, click on the **Apps** list → **au-design-studio** → **Logs** to observe live container transactions.

---

## 🔄 Updating your TrueNAS App when GitHub repos change
Since we configured the container pull policy to **Always**, pushing newer builds to GitHub automatically makes updates a single-click away:
1. Go to **Apps** -> **Installed Apps**.
2. Locate **au-design-studio**, click the action dropdown (three vertical dots), and press **Redeploy** (or hit the **Update** notification icon).
3. The server will launch with the current, updated web layout immediately.

---

## 🛠️ Step-by-Step commands to deploy to your personal GitHub

Run these commands in your local computer terminal within the project directory to push the complete, non-empty files (including `.github/workflows/deploy.yml` and `Dockerfile`):

```bash
# 1. Initialize local Git repository (if not already initiated)
git init

# 2. Add your personal GitHub repository remote origin
# (Replace with your actual GitHub username and repo name)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 3. Rename branch to main (standard default)
git branch -M main

# 4. Add all files to the commit staging area
# (This stages the complete Dockerfile, workflow, App, and config presets)
git add .

# 5. Commit everything locally
git commit -m "feat: implement dark mode support, custom scaling, exact dimensions, and CI workflows"

# 6. Push the code up to GitHub
# (Note: This first push automatically triggers the Build workflow)
git push -u origin main
```

### ⚙️ How to manually run the GitHub workflow from the terminal
GitHub compiles the app automatically on every `git push`. If you want to trigger it manually, use the **GitHub CLI (`gh`)**:
```bash
# Log into your GitHub CLI
gh auth login

# Trigger the deploy workflow manually from your terminal
gh workflow run deploy.yml --ref main
```

---

## 🛑 TrueNAS SCALE Troubleshooting & Common Errors

### 1. Error: `Cannot find module '/app/dist/server.cjs'`
* **Root Cause:** When configuring the Custom App inside TrueNAS SCALE's advanced options, you mapped a **Host Path Volume / Storage mount** directly over `/app` or `/app/dist`. Doing this mounts an empty or external host directory directly over the container's pre-compiled application folder, hiding all JavaScript files.
* **Resolution:** Under the TrueNAS custom app storage settings, **completely remove any host path mounts to `/app` or `/app/dist`**. The app is entirely stateless—no local host paths are required.

### 2. Error: `manifest unknown`
* **Root Cause A (Typo):** There is a slight spelling mistake in the host repository name, branch tag, or the username in TrueNAS setup.
* **Root Cause B (Package is Private):** By default, GitHub Container Registry (GHCR) initializes newly built packages as **Private**, preventing TrueNAS from fetching it without an auth key.
* **Resolution:** 
  1. Go to your GitHub profile, click on **Packages** in the header.
  2. Click on the **au-design-studio** package.
  3. Scroll down on the right sidebar and click **Package Settings**.
  4. Scroll to the bottom ("Danger Zone") and click **Change Visibility**. Select **Public** and confirm. TrueNAS will now be able to pull and launch the applet instantly!

### 3. Error: `Dockerfile: no such file or directory` or empty file
* **Root Cause:** The `Dockerfile` was not committed/pushed, or only a blank file was pushed.
* **Resolution:** Run the standard Git commands listed above to push our complete, 39-line, multi-stage optimized `Dockerfile` in the root repository.
