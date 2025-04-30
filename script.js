class MediaPlayer {
    constructor() {
        this.container = document.getElementById('media-container');
        this.elements = [];
        this.currentIndex = 0;
        this.imageDisplayTime = 5000; // 5 seconds for images
        this.isPlaying = false;
        this.loadingIndicator = document.querySelector('.loading');
        this.preloadNext = true; // Enable preloading
    }

    init() {
        this.elements = Array.from(this.container.children).filter(el => 
            el.tagName === 'IMG' || el.tagName === 'VIDEO'
        );
        
        if (this.elements.length === 0) {
            this.showError('No media files found. Please add images or videos.');
            return;
        }

        // Initialize all videos with required attributes
        this.elements.forEach((el, index) => {
            el.classList.add('media-item');
            if (el.tagName === 'VIDEO') {
                el.muted = true;
                el.playsInline = true;
                el.setAttribute('playsinline', '');
                el.addEventListener('error', () => this.handleMediaError(el));
                el.addEventListener('loadstart', () => this.showLoading());
                el.addEventListener('canplay', () => this.hideLoading());
                // Preload the first few videos
                if (index < 3) {
                    el.preload = 'auto';
                }
            } else if (el.tagName === 'IMG') {
                // Preload images
                el.loading = 'eager';
                if (el.complete) {
                    this.hideLoading();
                } else {
                    el.addEventListener('load', () => this.hideLoading());
                    el.addEventListener('error', () => this.handleMediaError(el));
                }
            }
        });

        // Start the slideshow
        this.play();
        
        // Add keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                // Space to pause/play
                this.isPlaying ? this.pause() : this.play();
            } else if (e.code === 'ArrowRight') {
                // Right arrow for next
                this.next();
            } else if (e.code === 'ArrowLeft') {
                // Left arrow for previous
                this.previous();
            }
        });
    }

    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
        }
    }

    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.showNext();
    }

    pause() {
        this.isPlaying = false;
        const current = this.elements[this.currentIndex];
        if (current.tagName === 'VIDEO') {
            current.pause();
        }
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.elements.length;
        this.showNext();
    }

    previous() {
        this.currentIndex = (this.currentIndex - 1 + this.elements.length) % this.elements.length;
        this.showNext();
    }

    preloadMedia(index) {
        if (!this.preloadNext) return;
        
        const nextElement = this.elements[index];
        if (nextElement.tagName === 'VIDEO') {
            nextElement.preload = 'auto';
            nextElement.load();
        } else if (nextElement.tagName === 'IMG') {
            new Image().src = nextElement.src;
        }
    }

    showNext() {
        if (!this.isPlaying) return;

        // Hide all elements
        this.elements.forEach(el => {
            el.classList.remove('active');
            if (el.tagName === 'VIDEO') {
                el.pause();
                el.currentTime = 0;
            }
        });

        const current = this.elements[this.currentIndex];
        current.classList.add('active');

        // Preload next item
        const nextIndex = (this.currentIndex + 1) % this.elements.length;
        this.preloadMedia(nextIndex);

        if (current.tagName === 'VIDEO') {
            this.showLoading();
            current.play()
                .then(() => {
                    this.hideLoading();
                    // Wait for video to end
                    current.onended = () => {
                        if (this.isPlaying) {
                            this.next();
                        }
                    };
                })
                .catch(error => {
                    console.error('Video playback error:', error);
                    this.hideLoading();
                    // Skip to next item if video fails
                    if (this.isPlaying) {
                        this.next();
                    }
                });
        } else {
            // For images, wait for the specified time
            setTimeout(() => {
                if (this.isPlaying) {
                    this.next();
                }
            }, this.imageDisplayTime);
        }
    }

    handleMediaError(element) {
        console.error(`Error loading media: ${element.src}`);
        this.hideLoading();
        const index = this.elements.indexOf(element);
        if (index > -1) {
            this.elements.splice(index, 1);
            element.remove();
        }
        if (this.elements.length === 0) {
            this.showError('All media files failed to load.');
        } else if (this.isPlaying) {
            this.next();
        }
    }

    showError(message) {
        this.hideLoading();
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const player = new MediaPlayer();
    player.init();

    // Handle fullscreen
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F11') {
            e.preventDefault();
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            }
        }
    });
}); 