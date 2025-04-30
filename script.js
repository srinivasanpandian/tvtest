class MediaPlayer {
    constructor() {
        this.container = document.getElementById('media-container');
        this.elements = [];
        this.currentIndex = 0;
        this.imageDisplayTime = 4000; // 4 seconds for images
        this.isPlaying = false;
        this.loadingIndicator = document.querySelector('.loading');
    }

    init() {
        this.elements = Array.from(this.container.children).filter(el => 
            el.tagName === 'IMG' || el.tagName === 'VIDEO'
        );
        
        if (this.elements.length === 0) {
            this.showError('No media files found. Please add images or videos.');
            return;
        }

        this.elements.forEach(el => {
            el.classList.add('media-item');
            if (el.tagName === 'VIDEO') {
                el.setAttribute('muted', '');
                el.setAttribute('playsinline', '');
                el.setAttribute('webkit-playsinline', '');
                el.muted = true;
                el.addEventListener('error', () => this.handleMediaError(el));
                el.addEventListener('loadstart', () => this.showLoading());
                el.addEventListener('canplay', () => this.hideLoading());
            } else if (el.tagName === 'IMG') {
                if (el.complete) {
                    this.hideLoading();
                } else {
                    el.addEventListener('load', () => this.hideLoading());
                    el.addEventListener('error', () => this.handleMediaError(el));
                }
            }
        });

        this.play();
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

        if (current.tagName === 'VIDEO') {
            this.showLoading();
            current.play()
                .then(() => {
                    this.hideLoading();
                    // Wait for video to end
                    current.onended = () => {
                        this.currentIndex = (this.currentIndex + 1) % this.elements.length;
                        this.showNext();
                    };
                })
                .catch(error => {
                    console.error('Video playback error:', error);
                    this.hideLoading();
                    // Skip to next item if video fails
                    this.currentIndex = (this.currentIndex + 1) % this.elements.length;
                    this.showNext();
                });
        } else {
            // For images, wait for the specified time
            setTimeout(() => {
                this.currentIndex = (this.currentIndex + 1) % this.elements.length;
                this.showNext();
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