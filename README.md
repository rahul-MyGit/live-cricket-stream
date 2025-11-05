# 🎥 CricketLive - Production-Ready RTMP Streaming Server

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-blue?style=for-the-badge)

**A scalable, production-ready RTMP ingest server with multi-bitrate HLS transcoding**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API Reference](#-api-reference) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Streaming Guide](#-streaming-guide)
- [Deployment](#-deployment)
- [Monitoring](#-monitoring)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

**CricketLive** is a high-performance, enterprise-grade RTMP streaming server built with TypeScript and Node.js. It receives live video streams via RTMP protocol, transcodes them into adaptive HLS (HTTP Live Streaming) format with multiple quality levels, and serves them through a RESTful API.

### Key Capabilities

- **RTMP Ingest**: Accept live streams from OBS, FFmpeg, or any RTMP-compatible client
- **Multi-Bitrate Transcoding**: Automatic adaptive streaming with multiple quality profiles
- **HLS Output**: Industry-standard HLS format for universal player compatibility
- **Low Latency**: Optimized profiles for real-time streaming applications
- **Production Ready**: Built with monitoring, metrics, logging, and error handling
- **Scalable**: Docker-ready with resource limits and health checks
- **Secure**: Rate limiting, CORS protection, and stream validation

## ✨ Features

### Core Features

- ✅ **RTMP Server** - Accept live streams on port 1935 (configurable)
- ✅ **Multi-Bitrate HLS** - Automatic transcoding with 1080p, 720p, and 480p
- ✅ **Adaptive Streaming** - Multiple quality profiles for optimal playback
- ✅ **Low Latency Mode** - Optimized for real-time streaming (2-second segments)
- ✅ **RESTful API** - Complete HTTP API for stream management
- ✅ **Prometheus Metrics** - Built-in monitoring and observability
- ✅ **Health Checks** - System health monitoring endpoints
- ✅ **Auto Cleanup** - Automatic removal of old HLS segments
- ✅ **Docker Support** - Full containerization with Docker Compose
- ✅ **TypeScript** - Fully typed codebase for better maintainability

### Advanced Features

- 🔒 **Stream Validation** - Validate stream keys before processing
- 📊 **Real-time Metrics** - Track active streams, errors, and performance
- 🗄️ **Flexible Storage** - Local storage with extensible architecture
- 🔄 **Graceful Shutdown** - Proper resource cleanup on termination
- 📝 **Structured Logging** - Winston-based logging with multiple transports
- ⚡ **Rate Limiting** - API protection with configurable limits
- 🛡️ **Security Headers** - Helmet.js for enhanced security

## 🏗️ Architecture

```
┌─────────────┐
│   RTMP      │  (Port 1935)
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   RTMP Server       │
│  (NodeMediaServer)  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Transcoder Manager  │
│  (FFmpeg Workers)   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  HLS Segments       │
│  (Local Storage)    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  HTTP API Server    │  (Port 8000)
│  (Express.js)       │
└─────────────────────┘
       │
       ├──► /api/streams  (Stream Management)
       ├──► /api/health   (Health Checks)
       ├──► /api/metrics  (Prometheus)
       └──► /hls/*        (HLS Playlists & Segments)
```

### Component Overview

- **RTMPServer**: Handles RTMP connections and stream lifecycle events
- **TranscoderManager**: Orchestrates FFmpeg workers for video processing
- **FFmpegWorker**: Individual transcoding process for each stream
- **StorageManager**: Manages HLS segment storage (local filesystem)
- **MetricsService**: Collects Prometheus metrics for monitoring
- **StreamService**: Business logic for stream operations
- **API Server**: RESTful HTTP API built with Express.js

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **FFmpeg** 4.0+ installed and accessible in PATH
- **npm** or **yarn** package manager
- **Docker** and **Docker Compose** (optional, for containerized deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cricketlive.git
cd cricketlive

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start the server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=8000
HOST=0.0.0.0
RTMP_PORT=1935

# Storage
HLS_ROOT=./hls
STORAGE_TYPE=local

# Transcoding
FFMPEG_PATH=ffmpeg
MAX_CONCURRENT_STREAMS=10

# Security
JWT_SECRET=your-secret-key-change-in-production
STREAM_SECRET=your-stream-secret-change-in-production

# Logging
LOG_LEVEL=info

# Metrics
ENABLE_METRICS=true
METRICS_PORT=9090

# Cleanup
CLEANUP_ENABLED=true
CLEANUP_INTERVAL_HOURS=6
STREAM_RETENTION_HOURS=24
```

### Verify Installation

1. **Check RTMP Server**: The RTMP server should be running on port `1935`
2. **Check API Server**: The HTTP API should be running on port `8000`
3. **Health Check**: Visit `http://localhost:8000/api/health`

## ⚙️ Configuration

### RTMP Configuration

```typescript
{
  port: 1935,              // RTMP server port
  chunkSize: 60000,        // Chunk size in bytes
  gopCache: true,          // Enable GOP cache
  ping: 30,                // Ping interval (seconds)
  pingTimeout: 60          // Ping timeout (seconds)
}
```

### Transcoding Profiles

The server supports two built-in transcoding profiles:

#### 1. Adaptive Profile (Default)

- **1080p**: 4500k bitrate, 128k audio
- **720p**: 2500k bitrate, 128k audio
- **480p**: 1200k bitrate, 96k audio
- **Segment Duration**: 4 seconds
- **Playlist Size**: 6 segments

#### 2. Low Latency Profile

- **720p**: 2000k bitrate, 128k audio
- **480p**: 1000k bitrate, 96k audio
- **Segment Duration**: 2 seconds
- **Playlist Size**: 3 segments
- **Flags**: `delete_segments` for real-time cleanup

### Custom Profiles

You can create custom transcoding profiles by modifying files in `src/core/transcoder/profile/`.

## 📡 API Reference

### Base URL

```
http://localhost:8000
```

### Endpoints

#### `GET /`

Get server information and available endpoints.

**Response:**
```json
{
  "name": "RTMP Streaming Server",
  "version": "2.0.0",
  "status": "running",
  "endpoints": {
    "health": "/api/health",
    "streams": "/api/streams",
    "metrics": "/api/metrics",
    "hls": "/hls/:streamKey/master.m3u8"
  }
}
```

#### `GET /api/health`

Get system health status.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 3600,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "rtmp": "operational",
    "transcoder": "operational",
    "storage": "operational"
  }
}
```

#### `GET /api/streams`

List all active streams.

**Response:**
```json
{
  "success": true,
  "data": {
    "streams": [
      {
        "streamKey": "my-stream",
        "startTime": "2024-01-01T00:00:00.000Z",
        "status": "active",
        "profile": "adaptive"
      }
    ],
    "total": 1
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/streams/:streamKey`

Get information about a specific stream.

**Response:**
```json
{
  "success": true,
  "data": {
    "streamKey": "my-stream",
    "startTime": "2024-01-01T00:00:00.000Z",
    "status": "active",
    "profile": "adaptive"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `DELETE /api/streams/:streamKey`

Stop a specific stream.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Stream stopped successfully"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/streams/stats`

Get streaming statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "activeStreams": 5,
    "maxStreams": 10
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/metrics`

Get Prometheus metrics (for monitoring systems).

**Content-Type:** `text/plain`

#### `GET /hls/:streamKey/master.m3u8`

Get HLS master playlist for a stream.

**Example:**
```
http://localhost:8000/hls/my-stream/master.m3u8
```

## 🎬 Streaming Guide

### Streaming with OBS Studio

1. **Open OBS Studio**
2. **Go to Settings → Stream**
3. **Service**: Custom
4. **Server**: `rtmp://localhost:1935/live`
5. **Stream Key**: `my-stream`
6. **Click "Start Streaming"**

### Streaming with FFmpeg

```bash
ffmpeg -re -i input.mp4 -c copy -f flv rtmp://localhost:1935/live/my-stream
```

### Playing the Stream

Once streaming, you can play the HLS stream using:

**HLS.js (Web Player):**
```html
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<video id="video"></video>
<script>
  const video = document.getElementById('video');
  const hls = new Hls();
  hls.loadSource('http://localhost:8000/hls/my-stream/master.m3u8');
  hls.attachMedia(video);
</script>
```

**VLC Media Player:**
- Open VLC → Media → Open Network Stream
- URL: `http://localhost:8000/hls/my-stream/master.m3u8`

**Video.js:**
```html
<link href="https://vjs.zencdn.net/7.20.3/video-js.css" rel="stylesheet">
<video class="video-js" data-setup='{}' controls>
  <source src="http://localhost:8000/hls/my-stream/master.m3u8" type="application/x-mpegURL">
</video>
```

## 🐳 Deployment

### Docker Deployment

#### Using Docker Compose (Recommended)

```bash
cd docker
docker-compose up -d
```

This will start:
- **RTMP Server** on port 8000, 1935, 9090
- **Prometheus** on port 9091 (metrics collection)
- **Grafana** on port 3000 (visualization)

#### Using Docker

```bash
# Build the image
docker build -f docker/Dockerfile.prod -t cricketlive:latest .

# Run the container
docker run -d \
  -p 8000:8000 \
  -p 1935:1935 \
  -p 9090:9090 \
  -v $(pwd)/hls:/var/hls \
  -v $(pwd)/logs:/app/logs \
  --name cricketlive \
  cricketlive:latest
```

### Production Deployment

#### Environment Setup

1. **Set Production Environment Variables:**
   ```env
   NODE_ENV=production
   LOG_LEVEL=info
   ENABLE_METRICS=true
   ```

2. **Configure Security:**
   - Change `JWT_SECRET` and `STREAM_SECRET`
   - Configure CORS origins
   - Set up firewall rules

3. **Resource Limits:**
   - CPU: 2-4 cores per 5 concurrent streams
   - Memory: 2GB per concurrent stream
   - Disk: 10GB per stream per hour (approximate)

#### Kubernetes Deployment

See `k8s/` directory for Kubernetes manifests (if available).

### Reverse Proxy (Nginx)

```nginx
# RTMP (for ingestion)
rtmp {
    server {
        listen 1935;
        application live {
            live on;
            push rtmp://localhost:1935/live;
        }
    }
}

# HTTP (for HLS playback)
server {
    listen 80;
    server_name your-domain.com;

    location /hls/ {
        proxy_pass http://localhost:8000/hls/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 Monitoring

### Prometheus Metrics

The server exposes Prometheus metrics at `/api/metrics`:

- `rtmp_active_streams` - Current number of active streams
- `rtmp_stream_starts_total` - Total stream starts (by profile)
- `rtmp_stream_ends_total` - Total stream ends (by reason)
- `rtmp_transcoding_errors_total` - Transcoding errors (by stream key)
- `rtmp_stream_duration_seconds` - Stream duration histogram

### Grafana Integration

The included Docker Compose setup includes Grafana with pre-configured dashboards for:
- Active streams monitoring
- Error rate tracking
- Stream duration analysis
- Resource utilization

### Health Checks

The health endpoint provides:
- System status
- Service availability
- Uptime information
- Resource usage

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure code passes linting

### Code Style

- Use TypeScript strict mode
- Prefer functional programming patterns
- Use descriptive variable names
- Follow existing code structure

## 📝 License

This project is licensed under the **ISC License**.

See `LICENSE` file for details.

## 🙏 Acknowledgments

- [node-media-server](https://github.com/illuspas/Node-Media-Server) - RTMP server implementation
- [FFmpeg](https://ffmpeg.org/) - Video transcoding
- [Express.js](https://expressjs.com/) - Web framework
- [Prometheus](https://prometheus.io/) - Metrics collection

## 🔗 Related Projects

- [HLS.js](https://github.com/video-dev/hls.js) - HLS player for web browsers
- [Video.js](https://videojs.com/) - HTML5 video player
- [OBS Studio](https://obsproject.com/) - Streaming software

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/cricketlive/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/cricketlive/discussions)
- **Email**: your-email@example.com

## ⭐ Star History

If you find this project useful, please consider giving it a star ⭐

---

<div align="center">

**Built with ❤️ using TypeScript, Node.js, and FFmpeg**

[⬆ Back to Top](#-cricketlive---production-ready-rtmp-streaming-server)

</div>
