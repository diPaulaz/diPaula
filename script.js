const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const centralPoint = document.getElementById('central');
const modal = document.getElementById('content-modal');
const closeModal = document.querySelector('.close');

const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33F0',
    '#33FFF0', '#F0FF33', '#FF3333', '#33FF33', '#3333FF',
    '#FF9900', '#00CCFF', '#CC00FF', '#FF00CC', '#00FF99'
];

function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    centralPoint.style.left = centerX + 'px';
    centralPoint.style.top = centerY + 'px';
    
    drawConnections();
}

function drawConnections() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    contentPoints.forEach(point => {
        const gradient = ctx.createLinearGradient(centerX, centerY, point.x, point.y);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
        gradient.addColorStop(1, point.color);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.stroke();
    });
}

function createTooltip(pointElement, title) {
    const tooltip = document.createElement('div');
    tooltip.className = 'title-tooltip';
    tooltip.textContent = title;
    document.body.appendChild(tooltip);
    
    function positionTooltip() {
        const pointRect = pointElement.getBoundingClientRect();
        tooltip.style.left = (pointRect.left + 25) + 'px';
        tooltip.style.top = (pointRect.top) + 'px';
    }
    
    pointElement.addEventListener('mouseenter', () => {
        positionTooltip();
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(0)';
    });
    
    pointElement.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(10px)';
    });
    
    return {
        update: positionTooltip,
        element: tooltip
    };
}

let contentPoints = [];

function createContentPoint(id, title, contentType, contentData, color, position) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const angleRad = position.angle * (Math.PI / 180);
    const x = centerX + Math.cos(angleRad) * position.distance;
    const y = centerY + Math.sin(angleRad) * position.distance;
    
    const point = document.createElement('div');
    point.className = 'content-point';
    point.style.backgroundColor = color;
    point.style.left = x + 'px';
    point.style.top = y + 'px';
    point.dataset.id = id;
    document.body.appendChild(point);
    
    const tooltip = createTooltip(point, title);
    
    point.addEventListener('click', () => {
        openModal(title, contentType, contentData);
    });
    
    contentPoints.push({
        id: id,
        x: x,
        y: y,
        color: color,
        title: title,
        type: contentType,
        data: contentData,
        tooltip: tooltip
    });
    
    drawConnections();
}

async function loadPosts() {
    try {
        const response = await fetch('posts.json');
        const data = await response.json();
        
        for (const postPath of data.posts) {
            const postResponse = await fetch(postPath);
            const postData = await postResponse.json();
            createContentPoint(
                postPath,
                postData.title,
                postData.type,
                postData.content,
                postData.color || colors[Math.floor(Math.random() * colors.length)],
                postData.position
            );
        }
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
    }
}

function openModal(title, contentType, contentData) {
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    modalTitle.textContent = title;
    modalContent.innerHTML = '';
    
    switch(contentType) {
        case 'text':
            modalContent.textContent = contentData;
            break;
        case 'image':
            const img = document.createElement('img');
            img.src = contentData;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '5px';
            modalContent.appendChild(img);
            break;
        case 'video':
            let videoId = '';
            if (contentData.includes('youtube.com/watch?v=')) {
                videoId = contentData.split('v=')[1].split('&')[0];
            } else if (contentData.includes('youtu.be/')) {
                videoId = contentData.split('youtu.be/')[1];
            }
            
            if (videoId) {
                const iframe = document.createElement('iframe');
                iframe.width = '100%';
                iframe.height = '400';
                iframe.src = `https://www.youtube.com/embed/${videoId}`;
                iframe.allowFullscreen = true;
                modalContent.appendChild(iframe);
            }
            break;
        case 'music':
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.style.width = '100%';
            const source = document.createElement('source');
            source.src = contentData;
            audio.appendChild(source);
            modalContent.appendChild(audio);
            break;
    }
    
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

window.addEventListener('resize', setupCanvas);

closeModal.addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    setupCanvas();
    loadPosts();
});