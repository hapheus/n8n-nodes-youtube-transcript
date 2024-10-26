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

For more detailed instructions and troubleshooting, refer to the official [Puppeteer documentation](https://pptr.dev/).

## Operations

* **Download YouTube Transcript**: Extracts the transcript of a specified YouTube video and makes it available in your workflow, either as plain text or JSON.

	**Important**: Not all YouTube videos have a transcript available.

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
