# n8n-nodes-youtube-transcript

This is an n8n community node that allows you to download transcripts from YouTube videos directly in your n8n workflows.

This version uses Puppeteer with the StealthPlugin. Puppeteer must be installed and running on your n8n instance. Since the node uses a browser instead of the internal API, it will only remain functional as long as the YouTube interface remains unchanged. Be aware that heavy usage may result in YouTube blocking IP addresses, which is beyond our control.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Prerequisites](#prerequisites)  
[Installation](#installation)  
[Operations](#operations)  
[Contributions](#contributions)  
[Resources](#resources)  
[License](#license)

## Prerequisites

- [n8n](https://n8n.io/) must be installed and set up.
- Puppeteer must be installed and running on your n8n instance.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Installing Puppeteer

To use this node, Puppeteer must be installed and configured on your n8n instance. Here’s a basic installation step:

1. **Install Puppeteer**:
	 ```bash
	 npm install puppeteer
	 ```

	 **Note**: During the installation of Puppeteer, it will attempt to download and install its own version of Chromium. This is a headless version of Chrome that Puppeteer uses by default. If your environment already has Chrome/Chromium installed, or if you want to avoid downloading it (especially in Docker environments), you can skip this download by setting an environment variable:

	 ```bash
	 PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install puppeteer
	 ```

2. **Running in Docker**:
	 If you use Docker, ensure Puppeteer can run properly by setting up any necessary dependencies. Make sure to adjust the `PUPPETEER_EXECUTABLE_PATH` if you want to use a custom Chrome/Chromium binary path.

   On n8n (pristine) self hosted docker image, run the following:
   
	```bash
	docker exec -it -u root n8n /bin/sh -c "apk update && apk add --no-cache nmap && echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && apk update && apk upgrade && apk add --no-cache udev chromium harfbuzz freetype ttf-freefont nss"
	```

	Set the following environment variables:

	```bash
 	PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
 	PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
	```
 

For more detailed instructions and troubleshooting, refer to the official [Puppeteer documentation](https://pptr.dev/).

### Example Docker Usage

A sample `Dockerfile` is provided in the `examples/docker` directory. This Dockerfile sets up a container with **Puppeteer** and **Chromium** pre-installed, allowing you to run **n8n-nodes-youtube-transcript and other nodes that require Puppeteer**.

**Note**: The `n8n-nodes-youtube-transcript` plugin itself is not installed within the Docker container by default; you’ll need to install it manually.

#### Building and running the Docker Image

To build the Docker image, navigate to the `examples/docker` directory and run the following command:

**Build the Docker Image**
```bash
cd examples/docker
docker build -t n8n-with-puppeteer .
```

**Run the Docker Image**
```bash
docker run -d -p 5678:5678 -v ./data/n8n:/home/node/.n8n n8n-with-puppeteer
```
This command does the following:

-d: Runs the container in the background as a daemon.
-p 5678:5678: Maps port 5678 on the container to port 5678 on your host machine (localhost).
-v ./data/n8n:/home/node/.n8n: Shares (or "mounts") the local directory ./data/n8n with the container's /home/node/.n8n directory.

#### Docker Compose Setup

For convenience, a `docker-compose.yml` file is provided in the `examples/docker-compose` directory. This Compose setup uses the custom Dockerfile from this project and sets up a **PostgreSQL** database as the backend for n8n. This makes it easy to deploy both services together with one command.

### Using Docker Compose

1. **Navigate to the directory** containing the `docker-compose.yml` file:

 ```bash
cd examples/docker-compose
docker-compose up -d 
```

## Operations

* **Download YouTube Transcript**: Extracts the transcript of a specified YouTube video and makes it available in your workflow, either as plain text or JSON.

	**Important**: Not all YouTube videos have a transcript available.

### Supported URLs

This node supports extracting transcripts from YouTube videos using both `youtube.com/watch?v=example` and `youtu.be/example` URL formats. Simply provide the video URL or ID in your n8n workflow, and the node will handle the rest.


## Contributions

Pull requests are welcome! If you encounter any issues or have suggestions for improvements:

1. **Fork the repository** and create your feature branch (`git checkout -b feature/AmazingFeature`).
2. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`).
3. **Push to the branch** (`git push origin feature/AmazingFeature`).
4. **Open a Pull Request**.

Please ensure that your code follows the style guide and includes tests if applicable.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

This project is licensed under the [n8n fair-code license](https://docs.n8n.io/reference/license/).
