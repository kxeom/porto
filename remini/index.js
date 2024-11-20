const dropZone = document.getElementById('drop'),
  fileInput = document.getElementById('file'),
  enhanceBtn = document.getElementById('enhanceBtn'),
  loadingState = document.getElementById('loadingState'),
  errorState = document.getElementById('errorState'),
  successState = document.getElementById('successState'),
  errorMessage = document.getElementById('errorMessage'),
  resultArea = document.getElementById('resultArea'),
  socket = io({
    'transports': ['websocket', 'polling'],
    'reconnection': true,
    'reconnectionAttempts': 0x5,
    'reconnectionDelay': 0x3e8,
    'reconnectionDelayMax': 0x1388,
    'timeout': 0x1d4c0,
    'maxHttpBufferSize': 52428800
  });
socket.on('connect', () => {
  console.log('Connected to server');
}), socket.on('connect_error', _0x56f3f2 => {
  console.error('Connection error:', _0x56f3f2), showError('Connection failed. Please try again.');
}), socket.on('disconnect', _0x4e7e5e => {
  console.error('Disconnected:', _0x4e7e5e), (_0x4e7e5e === 'transport close' || _0x4e7e5e === 'io server disconnect') && (console.log('Attempting to reconnect...'), socket.connect()), _0x4e7e5e === 'transport error' && showError('Connection lost. The file might be too large or the connection is unstable.');
});
function handleFile(_0x238ae2) {
  hideAllStates(), resultArea.innerHTML = '';
  if (!_0x238ae2) {
    showError('Please select a file');
    return;
  }
  const _0x13fa59 = ['image/jpeg', 'image/png', 'image/webp'];
  if (!_0x13fa59.includes(_0x238ae2.type)) {
    showError('Please select a valid image file (JPG, PNG, WEBP)');
    return;
  }
  if (_0x238ae2.size > 52428800) {
    showError('File size must be less than 50MB');
    return;
  }
  const _0x84155f = dropZone.querySelector('.upload-text');
  _0x84155f.innerHTML = '\n    <strong>' + _0x238ae2.name + '</strong>\n    <span>Ready to enhance</span>\n  ', enhanceBtn.disabled = false;
}
async function processImage(_0xbc79ad) {
  return new Promise((_0x1b9f0f, _0x5f2946) => {
    try {
      const _0x9fd342 = new FileReader();
      _0x9fd342.onerror = () => {
        _0x5f2946(new Error('Failed to read file'));
      }, _0x9fd342.onload = () => {
        try {
          const _0x16d8ba = setTimeout(() => {
            _0x5f2946(new Error('Upload timeout. Please try again.'));
          }, 120000);
          socket.emit('upload-image', {
            'file': _0x9fd342.result.split(',')[1],
            'filename': 'upload-' + Date.now() + '-' + _0xbc79ad.name
          }, _0x31248d => {
            _0x31248d && (clearTimeout(_0x16d8ba), _0x5f2946(new Error(_0x31248d.message || 'Upload failed')));
          }), socket.off('process-complete'), socket.off('process-error'), socket.on('process-complete', _0x48cd51 => {
            clearTimeout(_0x16d8ba);
            if (!_0x48cd51 || !_0x48cd51.hdUrl || !_0x48cd51.originalUrl) {
              _0x5f2946(new Error('Invalid response from server'));
              return;
            }
            _0x1b9f0f(_0x48cd51);
          }), socket.on('process-error', _0x49f48f => {
            clearTimeout(_0x16d8ba), _0x5f2946(new Error(_0x49f48f.message || 'Processing failed'));
          });
        } catch (_0x572009) {
          _0x5f2946(new Error('Failed to upload file'));
        }
      }, _0x9fd342.readAsDataURL(_0xbc79ad);
    } catch (_0x45e8a7) {
      _0x5f2946(new Error('Failed to process image'));
    }
  });
}
function showResult(_0x380411, _0x554fa5, _0x2c30da = 0) {
  const _0x576bd1 = 5,
    _0x1222a9 = _0x380411,
    _0x2e6788 = _0x554fa5;
  resultArea.innerHTML = '\n    <div class="comparison-wrap loading">\n      <div class="diff">\n        <div class="diff-item-1">\n          <div class="skeleton image-skeleton"></div>\n          <div class="diff-label">Before</div>\n        </div>\n        <div class="diff-item-2">\n          <div class="skeleton image-skeleton"></div>\n          <div class="diff-label">After</div>\n        </div>\n      </div>\n    </div>\n  ';
  function _0x5b67c4(_0x342d4e) {
    return new Promise((_0x12299a, _0xd459e6) => {
      const _0x4aad5e = new Image();
      _0x4aad5e.onload = () => _0x12299a(_0x4aad5e), _0x4aad5e.onerror = () => _0xd459e6(new Error('Failed to load image: ' + _0x342d4e)), _0x4aad5e.src = _0x342d4e;
    });
  }
  Promise.all([_0x5b67c4(_0x1222a9), _0x5b67c4(_0x2e6788)]).then(([_0x453acf, _0x3ab33b]) => {
    const _0x4d47f5 = resultArea.querySelector('.comparison-wrap');
    _0x4d47f5.classList.remove('loading'), resultArea.innerHTML = '\n        <div class="comparison-wrap">\n          <div class="diff" style="visibility: hidden">\n            <div class="diff-item-1">\n              <img \n                src="' + _0x1222a9 + '?t=' + Date.now() + '" \n                alt="Original" \n                style="max-width: 100%; width: 100%; aspect-ratio: 1/1; object-fit: cover; display: block;"\n                crossorigin="anonymous"\n              >\n              <div class="diff-label">Before</div>\n            </div>\n            <div class="diff-item-2">\n              <img \n                src="' + _0x2e6788 + '?t=' + Date.now() + '" \n                alt="Enhanced" \n                style="max-width: 100%; width: 100%; aspect-ratio: 1/1; object-fit: cover; display: block;"\n                crossorigin="anonymous"\n              >\n              <div class="diff-label">After</div>\n            </div>\n            <div class="diff-resizer"></div>\n          </div>\n          <div class="result-actions">\n            <div class="countdown-wrapper">\n              <div class="countdown" id="countdown">\n                <svg viewBox="0 0 36 36" class="countdown-circle">\n                  <path d="M18 2.0845\n                    a 15.9155 15.9155 0 0 1 0 31.831\n                    a 15.9155 15.9155 0 0 1 0 -31.831"\n                    fill="none"\n                    stroke="#FF5252"\n                    stroke-width="2"\n                    stroke-dasharray="100, 100"\n                    class="countdown-progress"\n                  />\n                </svg>\n                <span class="countdown-number">10:00</span>\n              </div>\n              <span class="countdown-label">Time remaining until auto-deletion</span>\n            </div>\n            <button class="btn-download" onclick="downloadImage(\'' + _0x2e6788 + '\', \'' + _0x3ab33b.naturalWidth + 'x' + _0x3ab33b.naturalHeight + '\')">\n              <span class="btn-content">\n                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">\n                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>\n                  <polyline points="7 10 12 15 17 10"/>\n                  <line x1="12" y1="15" x2="12" y2="3"/>\n                </svg>\n                <span>Download Enhanced Image</span>\n              </span>\n              <span class="btn-loader"></span>\n            </button>\n          </div>\n        </div>\n      ';
    const _0x38e640 = resultArea.querySelector('.diff'),
      _0x12ec92 = _0x38e640.querySelectorAll('img');
    Promise.all([..._0x12ec92].map(_0x2f2fbd => {
      return new Promise(_0x22f1cf => {
        _0x2f2fbd.complete ? _0x22f1cf() : (_0x2f2fbd.onload = () => _0x22f1cf(), _0x2f2fbd.onerror = () => {
          _0x2f2fbd.src = localStorage.getItem(_0x2f2fbd.src) || _0x2f2fbd.src, _0x22f1cf();
        });
      });
    })).then(() => {
      _0x38e640.style.visibility = 'visible', initDiffSlider(), startCountdown(600);
    });
  }).catch(_0x2ec3b7 => {
    console.error('Loading attempt ' + (_0x2c30da + 1) + ' failed:', _0x2ec3b7), _0x2c30da < _0x576bd1 ? (console.log('Retrying... Attempt ' + (_0x2c30da + 1) + ' of ' + _0x576bd1), setTimeout(() => {
      showResult(_0x380411, _0x554fa5, _0x2c30da + 1);
    }, 1000)) : (console.error('Max retries reached'), resultArea.innerHTML = '\n          <div class="error-message">\n            <p>Failed to load images after multiple attempts.</p>\n            <button onclick="showResult(\'' + _0x380411 + '\', \'' + _0x554fa5 + '\', 0)">Try Again</button>\n          </div>\n        ');
  });
}
function retryLoadImages(_0x15ed41, _0x1f2ead) {
  showResult(_0x15ed41, _0x1f2ead);
}
function hideAllStates() {
  loadingState.classList.add('hidden'), errorState.classList.add('hidden'), successState.classList.add('hidden');
}
function showLoading() {
  hideAllStates(), loadingState.classList.remove('hidden'), enhanceBtn.disabled = true;
}
function showError(_0x207304) {
  hideAllStates(), errorMessage.textContent = _0x207304, errorState.classList.remove('hidden'), enhanceBtn.disabled = true;
}
function showSuccess() {
  hideAllStates(), successState.classList.remove('hidden');
}
dropZone.addEventListener('click', () => fileInput.click()), dropZone.addEventListener('dragover', _0x3b178a => {
  _0x3b178a.preventDefault(), dropZone.classList.add('drag');
}), dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag');
}), dropZone.addEventListener('drop', _0x1c5ad8 => {
  _0x1c5ad8.preventDefault(), dropZone.classList.remove('drag'), handleFile(_0x1c5ad8.dataTransfer.files[0]);
}), fileInput.addEventListener('change', () => {
  handleFile(fileInput.files[0]);
}), enhanceBtn.addEventListener('click', async () => {
  const _0x524346 = fileInput.files[0];
  if (!_0x524346) return;
  showLoading();
  try {
    const {
      originalUrl: _0x4a59c3,
      hdUrl: _0x25c779
    } = await processImage(_0x524346);
    if (!_0x25c779) throw new Error('Failed to get enhanced image');
    showSuccess(), showResult(_0x4a59c3, _0x25c779);
  } catch (_0x5deabd) {
    console.error('Processing error:', _0x5deabd), showError(_0x5deabd.message);
  }
});
function initDiffSlider() {
  const _0x3acd0a = document.querySelector('.diff');
  if (!_0x3acd0a) return;
  const _0x2e6106 = _0x3acd0a.querySelector('.diff-resizer'),
    _0x3b5c05 = _0x3acd0a.querySelector('.diff-item-2'),
    _0x3ea1bc = _0x3acd0a.querySelectorAll('img');
  let _0x151bbf = false;
  Promise.all([..._0x3ea1bc].map(_0x43080d => {
    return new Promise(_0x364ad2 => {
      _0x43080d.complete ? _0x364ad2() : (_0x43080d.onload = () => _0x364ad2(), _0x43080d.onerror = () => _0x364ad2());
    });
  })).then(() => {
    setTimeout(() => {
      _0x33c9ef(_0x3acd0a.getBoundingClientRect().width / 2 + _0x3acd0a.getBoundingClientRect().left), _0x3acd0a.style.visibility = 'visible';
    }, 100);
  });
  function _0x33c9ef(_0x30f372) {
    const _0x298170 = _0x3acd0a.getBoundingClientRect(),
      _0x45f1f5 = Math.max(0, Math.min(_0x30f372 - _0x298170.left, _0x298170.width)),
      _0xb8076f = _0x45f1f5 / _0x298170.width * 100;
    requestAnimationFrame(() => {
      _0x2e6106.style.left = _0xb8076f + '%', _0x3b5c05.style.clipPath = 'polygon(' + _0xb8076f + '% 0, 100% 0, 100% 100%, ' + _0xb8076f + '% 100%)';
    });
  }
  function _0x575c0d(_0xf8a71d) {
    _0x151bbf = true, _0x3acd0a.classList.add('resizing');
  }
  function _0x5c538e(_0x162122) {
    if (!_0x151bbf) return;
    const _0x5674e2 = _0x162122.type.includes('touch') ? _0x162122.touches[0].clientX : _0x162122.clientX;
    _0x33c9ef(_0x5674e2);
  }
  function _0x393072() {
    _0x151bbf = false, _0x3acd0a.classList.remove('resizing');
  }
  _0x2e6106.addEventListener('mousedown', _0x575c0d), document.addEventListener('mousemove', _0x5c538e), document.addEventListener('mouseup', _0x393072), _0x2e6106.addEventListener('touchstart', _0x1bb5b3 => {
    _0x1bb5b3.preventDefault(), _0x575c0d(_0x1bb5b3);
  }), document.addEventListener('touchmove', _0x16a2d7 => {
    if (!_0x151bbf) return;
    _0x16a2d7.preventDefault(), _0x5c538e(_0x16a2d7);
  }, {
    'passive': false
  }), document.addEventListener('touchend', _0x393072), document.addEventListener('touchcancel', _0x393072);
}
async function downloadImage(_0x5d4ef3, _0x2ad451) {
  const _0x437dd7 = document.querySelector('.btn-download');
  if (!_0x437dd7 || _0x437dd7.classList.contains('loading')) return;
  try {
    _0x437dd7.classList.add('loading');
    const _0x5a3b8b = await fetch(_0x5d4ef3 + '?t=' + Date.now());
    if (!_0x5a3b8b.ok) throw new Error('Download failed');
    const _0x3f0504 = await _0x5a3b8b.blob(),
      _0x28f149 = 'enhanced-image-' + _0x2ad451 + '.' + getFileExtension(_0x5d4ef3),
      _0x99c96a = window.URL.createObjectURL(_0x3f0504),
      _0x99599c = document.createElement('a');
    _0x99599c.href = _0x99c96a, _0x99599c.download = _0x28f149, document.body.appendChild(_0x99599c), _0x99599c.click(), document.body.removeChild(_0x99599c), window.URL.revokeObjectURL(_0x99c96a), _0x437dd7.classList.remove('loading');
  } catch (_0x14163d) {
    console.error('Download error:', _0x14163d), _0x437dd7.classList.remove('loading'), alert('Download failed. Please try again.');
  }
}
function getFileExtension(_0x49be9f) {
  const _0x5790d7 = _0x49be9f.split('.').pop().split('?')[0].toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp'].includes(_0x5790d7) ? _0x5790d7 : 'jpg';
}
function startCountdown(_0x31e631) {
  const _0x3c7a3c = document.getElementById('countdown'),
    _0x545863 = _0x3c7a3c.querySelector('.countdown-number'),
    _0x167b05 = _0x3c7a3c.querySelector('.countdown-progress'),
    _0x25cfbb = Date.now(),
    _0x6e4f1f = _0x25cfbb + _0x31e631 * 1000;
  function _0x460cf7() {
    const _0x23ec04 = Date.now(),
      _0x483544 = Math.max(0, _0x6e4f1f - _0x23ec04),
      _0x3bfd5c = Math.floor(_0x483544 / 1000 / 60),
      _0x3fdd35 = Math.floor(_0x483544 / 1000 % 60);
    _0x545863.textContent = _0x3bfd5c + ':' + _0x3fdd35.toString().padStart(2, '0');
    const _0x451c90 = _0x483544 / (_0x31e631 * 1000) * 100;
    _0x167b05.style.strokeDasharray = _0x451c90 + ', 100', _0x483544 > 0 ? requestAnimationFrame(_0x460cf7) : resultArea.innerHTML = '<p style="text-align: center">The enhanced image has been automatically deleted.</p>';
  }
  _0x460cf7();
}
function handleImageError(_0x562c55) {
  console.error('Image failed to load:', _0x562c55.src), !_0x562c55.src.includes('retry=true') ? setTimeout(() => {
    _0x562c55.src = '' + _0x562c55.src + (_0x562c55.src.includes('?') ? '&' : '?') + 'retry=true&t=' + Date.now();
  }, 1000) : showError('Failed to load image. Please try again.');
}
document.addEventListener('DOMContentLoaded', () => {
  window.scrollToUpscaler = function () {
    const _0x2a8a20 = document.querySelector('.tool-section');
    if (_0x2a8a20) {
      const _0x3f0a27 = _0x2a8a20.offsetTop,
        _0x4b4ead = window.pageYOffset,
        _0x56861e = _0x3f0a27 - _0x4b4ead,
        _0x522dc1 = 1000;
      let _0x57b790 = null;
      function _0x302f12(_0x214652) {
        if (_0x57b790 === null) _0x57b790 = _0x214652;
        const _0x24374e = _0x214652 - _0x57b790,
          _0x305bf8 = _0x10de19(_0x24374e, _0x4b4ead, _0x56861e, _0x522dc1);
        window.scrollTo(0, _0x305bf8);
        if (_0x24374e < _0x522dc1) requestAnimationFrame(_0x302f12);
      }
      function _0x10de19(_0x5f213c, _0x2d32c, _0x1e99ee, _0x387238) {
        _0x5f213c /= _0x387238 / 2;
        if (_0x5f213c < 1) return _0x1e99ee / 2 * _0x5f213c * _0x5f213c + _0x2d32c;
        return _0x5f213c--, -_0x1e99ee / 2 * (_0x5f213c * (_0x5f213c - 2) - 1) + _0x2d32c;
      }
      requestAnimationFrame(_0x302f12);
    }
  }, document.getElementById('scrollIndicator').addEventListener('click', _0xde9bac => {
    _0xde9bac.preventDefault(), scrollToUpscaler();
  }), document.addEventListener('error', function (_0x3a276b) {
    _0x3a276b.target.tagName.toLowerCase() === 'img' && (console.error('Image failed to load:', _0x3a276b.target.src), handleImageError(_0x3a276b.target));
  }, true);
}), n;
