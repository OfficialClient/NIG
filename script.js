document.addEventListener('DOMContentLoaded', () => {
    const numberInput = document.getElementById('number');
    const iconPreview = document.getElementById('icon-preview');
    const colorList = document.getElementById('color-list');
    const bgTypeSelect = document.getElementById('bg-type');
    const directionSlider = document.getElementById('gradient-direction');
    const addColorBtn = document.getElementById('add-color');
    const shapeSelect = document.getElementById('shape');
    const savePresetBtn = document.getElementById('save-preset');
    const presetsList = document.getElementById('presets-list');

    let colors = ['#5a4fcf', '#a38fff'];

    function updatePreview() {
        const num = String(Math.min(Math.max(1, parseInt(numberInput.value) || 1), 20)).padStart(2, '0');
        const type = bgTypeSelect.value;
        const direction = directionSlider.value;
        const shape = shapeSelect.value;
        let bg = '';

        if (type === 'solid') {
            bg = colors[0];
        } else if (type === 'linear') {
            bg = `linear-gradient(${direction}deg, ${colors.join(', ')})`;
        } else {
            bg = `radial-gradient(circle, ${colors.join(', ')})`;
        }

        iconPreview.style.background = bg;
        iconPreview.style.borderRadius = shape;
        iconPreview.textContent = num;
    }

    function renderColors() {
        colorList.innerHTML = '';
        colors.forEach((col, idx) => {
            const cell = document.createElement('div');
            cell.className = 'color-cell';

            const input = document.createElement('input');
            input.type = 'color';
            input.value = col;
            input.addEventListener('input', (e) => {
                colors[idx] = e.target.value;
                updatePreview();
            });

            const remove = document.createElement('div');
            remove.className = 'remove-btn';
            remove.textContent = '×';
            remove.addEventListener('click', () => {
                if (colors.length > 2) {
                    colors.splice(idx, 1);
                    renderColors();
                    updatePreview();
                }
            });

            cell.appendChild(input);
            cell.appendChild(remove);
            cell.style.background = col;
            colorList.appendChild(cell);
        });
    }

    function savePreset() {
        const preset = {
            number: numberInput.value,
            bgType: bgTypeSelect.value,
            direction: directionSlider.value,
            shape: shapeSelect.value,
            colors: [...colors],
        };
        const presets = JSON.parse(localStorage.getItem('iconPresets') || '[]');
        presets.push(preset);
        localStorage.setItem('iconPresets', JSON.stringify(presets));
        loadPresets();
    }

    function loadPresets() {
        presetsList.innerHTML = '';
        const presets = JSON.parse(localStorage.getItem('iconPresets') || '[]');
        presets.forEach((p, i) => {
            const item = document.createElement('div');
            item.className = 'preset-item';

            const actions = document.createElement('div');
            actions.className = 'preset-actions';

            const apply = document.createElement('button');
            apply.textContent = 'Apply Preset';
            apply.onclick = () => {
                numberInput.value = p.number;
                bgTypeSelect.value = p.bgType;
                directionSlider.value = p.direction;
                shapeSelect.value = p.shape;
                colors = [...p.colors];
                renderColors();
                updatePreview();
            };

            const theme = document.createElement('button');
            theme.textContent = 'Apply Theme';
            theme.onclick = () => {
                bgTypeSelect.value = p.bgType;
                directionSlider.value = p.direction;
                colors = [...p.colors];
                renderColors();
                updatePreview();
            };


            const remove = document.createElement('button');
            remove.textContent = 'Remove';
            remove.className = 'remove';
            remove.onclick = () => {
                const updated = presets.filter((_, j) => j !== i);
                localStorage.setItem('iconPresets', JSON.stringify(updated));
                loadPresets();
            };

            actions.appendChild(apply);
            actions.appendChild(theme);
            actions.appendChild(remove);

            const preview = document.createElement('div');
            preview.className = 'preset-preview';
            preview.style.background = p.bgType === 'solid'
                ? p.colors[0]
                : (p.bgType === 'linear'
                    ? `linear-gradient(${p.direction}deg, ${p.colors.join(',')})`
                    : `radial-gradient(circle, ${p.colors.join(',')})`);
            preview.style.borderRadius = p.shape;
            preview.style.width = '60px';
            preview.style.height = '60px';
            preview.style.marginLeft = 'auto';

            item.appendChild(actions);
            item.appendChild(preview);
            presetsList.appendChild(item);
        });
    }

    // Download and copy utilities
    function downloadAsPNG() {
        html2canvas(iconPreview, { backgroundColor: null }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'icon.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    }

    function downloadAsSVG() {
        const cloned = iconPreview.cloneNode(true);
        cloned.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
        cloned.style.width = "200px";
        cloned.style.height = "200px";
        cloned.style.display = "flex";
        cloned.style.alignItems = "center";
        cloned.style.justifyContent = "center";

        const serializer = new XMLSerializer();
        const serialized = serializer.serializeToString(cloned);

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
            <foreignObject width="100%" height="100%">
                ${serialized}
            </foreignObject>
        </svg>`;

        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = 'icon.svg';
        link.href = URL.createObjectURL(blob);
        link.click();
    }


    function copyAsPNG() {
        html2canvas(iconPreview, { backgroundColor: null }).then(canvas => {
            canvas.toBlob(blob => {
                if (!blob) return alert('Failed to create blob from canvas.');

                if (navigator.clipboard && window.ClipboardItem) {
                    const item = new ClipboardItem({ 'image/png': blob });
                    navigator.clipboard.write([item]).then(() => {
                        alert('Icon copied to clipboard as PNG!');
                    }).catch(err => {
                        console.error('Clipboard write failed:', err);
                        alert('Clipboard write failed. Is this page HTTPS?');
                    });
                } else {
                    alert('Clipboard API not supported in this browser.');
                }
            });
        });
    }
    
    // Event listeners
    numberInput.addEventListener('input', updatePreview);
    bgTypeSelect.addEventListener('change', updatePreview);
    directionSlider.addEventListener('input', updatePreview);
    shapeSelect.addEventListener('change', updatePreview);
    addColorBtn.addEventListener('click', () => {
        if (colors.length < 5) {
            colors.push('#ffffff');
            renderColors();
            updatePreview();
        }
    });
    savePresetBtn.addEventListener('click', savePreset);

    // Button handlers (make sure these buttons exist in your HTML)
    document.getElementById('download-png')?.addEventListener('click', downloadAsPNG);
    document.getElementById('download-svg')?.addEventListener('click', downloadAsSVG);
    document.getElementById('copy-png')?.addEventListener('click', copyAsPNG);

    // Init
    renderColors();
    updatePreview();
    loadPresets();
});
