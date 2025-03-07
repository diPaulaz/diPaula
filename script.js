// Configuração inicial
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const centralPoint = document.getElementById('central');
const modal = document.getElementById('content-modal');
const modalContent = document.querySelector('.modal-content');
const addButton = document.getElementById('add-content-button');
const addForm = document.getElementById('add-content-form');
const saveButton = document.getElementById('save-content');
const cancelButton = document.getElementById('cancel-add');
const closeModal = document.querySelector('.close');

// Para armazenar os dados dos pontos
let contentPoints = [];

// Cores possíveis para os pontos
const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33F0',
    '#33FFF0', '#F0FF33', '#FF3333', '#33FF33', '#3333FF',
    '#FF9900', '#00CCFF', '#CC00FF', '#FF00CC', '#00FF99'
];

// Configuração do canvas
function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Posicionar o ponto central no meio da tela
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    centralPoint.style.left = centerX + 'px';
    centralPoint.style.top = centerY + 'px';
    
    drawConnections();
}

// Desenhar as conexões entre pontos
function drawConnections() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    contentPoints.forEach(point => {
        // Desenhar linha com gradiente
        const gradient = ctx.createLinearGradient(centerX, centerY, point.x, point.y);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
        gradient.addColorStop(1, point.color);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1; // Linha mais fina
        ctx.stroke();
    });
}

// Animar um ponto
function animatePoint(point) {
    point.style.animation = 'pulse 1.5s infinite';
    setTimeout(() => {
        point.style.animation = '';
    }, 1500);
}

// Função para criar tooltips para os pontos
function createTooltip(pointElement, title) {
    // Criar tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'title-tooltip';
    tooltip.textContent = title;
    document.body.appendChild(tooltip);
    
    // Posicionar tooltip ao lado do ponto
    function positionTooltip() {
        const pointRect = pointElement.getBoundingClientRect();
        tooltip.style.left = (pointRect.left + 25) + 'px';
        tooltip.style.top = (pointRect.top) + 'px';
    }
    
    // Mostrar tooltip no hover
    pointElement.addEventListener('mouseenter', () => {
        positionTooltip();
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(0)';
    });
    
    // Esconder tooltip quando sair do hover
    pointElement.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(10px)';
    });
    
    // Atualizar posição do tooltip durante a animação
    return {
        update: positionTooltip,
        element: tooltip
    };
}

// Criar um novo ponto de conteúdo
function createContentPoint(id, title, contentType, contentData) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Calcular uma posição aleatória para o ponto
    const angle = Math.random() * Math.PI * 2;
    const distance = 150 + Math.random() * 150;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    // Escolher uma cor aleatória
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Criar o ponto no DOM
    const point = document.createElement('div');
    point.className = 'content-point';
    point.style.backgroundColor = color;
    point.style.left = x + 'px';
    point.style.top = y + 'px';
    point.dataset.id = id;
    document.body.appendChild(point);
    
    // Criar tooltip para o ponto
    const tooltip = createTooltip(point, title);
    
    // Adicionar evento de clique
    point.addEventListener('click', () => {
        openModal(title, contentType, contentData);
        animatePoint(point);
    });
    
    // Adicionar à lista de pontos
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
    
    // Redesenhar as conexões
    drawConnections();
    
    // Salvar no localStorage
    saveToLocalStorage();
}

// Abrir o modal com o conteúdo
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
            img.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            modalContent.appendChild(img);
            break;
        case 'video':
            // Assumindo uma URL do YouTube
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
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                iframe.allowFullscreen = true;
                iframe.style.borderRadius = '5px';
                modalContent.appendChild(iframe);
            } else {
                modalContent.textContent = 'URL de vídeo inválida';
            }
            break;
        case 'music':
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.style.width = '100%';
            audio.style.marginTop = '10px';
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

// Salvar dados no localStorage
function saveToLocalStorage() {
    // Remover tooltips da estrutura antes de salvar
    const pointsToSave = contentPoints.map(point => {
        const { tooltip, ...pointData } = point;
        return pointData;
    });
    
    localStorage.setItem('contentPoints', JSON.stringify(pointsToSave));
}

// Carregar dados do localStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('contentPoints');
    if (saved) {
        const savedPoints = JSON.parse(saved);
        // Limpar pontos existentes
        contentPoints = [];
        document.querySelectorAll('.content-point').forEach(el => el.remove());
        document.querySelectorAll('.title-tooltip').forEach(el => el.remove());
        
        // Recriar os pontos
        savedPoints.forEach(point => {
            const newPoint = document.createElement('div');
            newPoint.className = 'content-point';
            newPoint.style.backgroundColor = point.color;
            newPoint.style.left = point.x + 'px';
            newPoint.style.top = point.y + 'px';
            newPoint.dataset.id = point.id;
            document.body.appendChild(newPoint);
            
            // Criar tooltip para o ponto
            const tooltip = createTooltip(newPoint, point.title);
            
            newPoint.addEventListener('click', () => {
                openModal(point.title, point.type, point.data);
                animatePoint(newPoint);
            });
            
            // Remover a animação inicial
            newPoint.style.opacity = '1';
            newPoint.style.animation = 'none';
            
            // Adicionar tooltip ao point
            point.tooltip = tooltip;
            
            contentPoints.push(point);
        });
        
        drawConnections();
    }
}

// Eventos
window.addEventListener('resize', setupCanvas);

addButton.addEventListener('click', () => {
    addButton.style.display = 'none';
    addForm.style.display = 'block';
    setTimeout(() => {
        addForm.classList.add('active');
    }, 10);
});

cancelButton.addEventListener('click', () => {
    addForm.classList.remove('active');
    setTimeout(() => {
        addForm.style.display = 'none';
        addButton.style.display = 'block';
        resetForm();
    }, 300);
});

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

// Alternar campos baseado no tipo de conteúdo
document.querySelectorAll('input[name="type"]').forEach(radio => {
    radio.addEventListener('change', () => {
        document.querySelectorAll('.type-specific').forEach(el => {
            el.style.display = 'none';
        });
        
        const selected = document.querySelector('input[name="type"]:checked').value;
        document.getElementById(`${selected}-content`).style.display = 'block';
    });
});

saveButton.addEventListener('click', () => {
    const title = document.getElementById('content-title').value;
    if (!title) {
        alert('Por favor, adicione um título');
        return;
    }
    
    const type = document.querySelector('input[name="type"]:checked').value;
    let data = '';
    
    switch(type) {
        case 'text':
            data = document.getElementById('text-data').value;
            break;
        case 'image':
            data = document.getElementById('image-url').value;
            break;
        case 'video':
            data = document.getElementById('video-url').value;
            break;
        case 'music':
            data = document.getElementById('music-url').value;
            break;
    }
    
    if (!data) {
        alert('Por favor, adicione o conteúdo');
        return;
    }
    
    // Criar um ID único baseado na data
    const id = Date.now().toString();
    
    // Esconder o formulário com animação
    addForm.classList.remove('active');
    setTimeout(() => {
        addForm.style.display = 'none';
        addButton.style.display = 'block';
        
        // Criar o ponto após a animação de fechamento
        createContentPoint(id, title, type, data);
        
        // Resetar o formulário
        resetForm();
    }, 300);
});

function resetForm() {
    document.getElementById('content-title').value = '';
    document.getElementById('text-data').value = '';
    document.getElementById('image-url').value = '';
    document.getElementById('video-url').value = '';
    document.getElementById('music-url').value = '';
    document.getElementById('type-text').checked = true;
    
    document.querySelectorAll('.type-specific').forEach(el => {
        el.style.display = 'none';
    });
    document.getElementById('text-content').style.display = 'block';
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    setupCanvas();
    loadFromLocalStorage();
});