"use strict";
class OrgTree {
    svg;
    viewBox;
    isPanning;
    startX;
    startY;
    zoomLevel;
    nodes;
    options;
    constructor(svgId, nodes, options) {
        const svgElement = document.getElementById(svgId);
        if (!svgElement || !(svgElement instanceof SVGSVGElement)) {
            throw new Error('Elemento SVG no encontrado o no es un SVGSVGElement');
        }
        this.svg = svgElement;
        this.svg.setAttribute('viewBox', '0 0 800 600');
        this.viewBox = this.svg.viewBox.baseVal;
        this.isPanning = false;
        this.startX = 0;
        this.startY = 0;
        this.zoomLevel = 1;
        this.nodes = nodes;
        this.options = options;
        this.initEventListeners();
        this.loadNodes();
    }
    initEventListeners() {
        this.svg.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.svg.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.svg.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.svg.addEventListener('mouseleave', this.onMouseLeave.bind(this));
        this.svg.addEventListener('wheel', this.onWheel.bind(this));
    }
    onMouseDown(event) {
        this.isPanning = true;
        this.startX = event.clientX;
        this.startY = event.clientY;
    }
    onMouseMove(event) {
        if (this.isPanning) {
            let dx = (this.startX - event.clientX) / (this.zoomLevel * 1.225);
            let dy = (this.startY - event.clientY) / (this.zoomLevel * 1.225);
            this.viewBox.x += dx;
            this.viewBox.y += dy;
            this.startX = event.clientX;
            this.startY = event.clientY;
        }
    }
    onMouseUp() {
        this.isPanning = false;
    }
    onMouseLeave() {
        this.isPanning = false;
    }
    onWheel(event) {
        event.preventDefault();
        const zoomFactor = 0.1;
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        const svgRect = this.svg.getBoundingClientRect();
        const offsetX = mouseX - svgRect.left;
        const offsetY = mouseY - svgRect.top;
        const scaleX = offsetX / svgRect.width;
        const scaleY = offsetY / svgRect.height;
        const prevViewBoxWidth = this.viewBox.width;
        const prevViewBoxHeight = this.viewBox.height;
        if (event.deltaY < 0) {
            // Zoom in
            this.zoomLevel = Math.min(5, this.zoomLevel + zoomFactor);
        }
        else {
            // Zoom out
            this.zoomLevel = Math.max(0.5, this.zoomLevel - zoomFactor);
        }
        this.viewBox.width = 800 / this.zoomLevel;
        this.viewBox.height = 600 / this.zoomLevel;
        // Calculate new viewBox position to keep the zoom centered
        this.viewBox.x += (prevViewBoxWidth - this.viewBox.width) * scaleX;
        this.viewBox.y += (prevViewBoxHeight - this.viewBox.height) * scaleY;
    }
    // Cargamos los nodos en el SVG
    loadNodes() {
        // Determino cuantos hijos tiene cada nodo
        this.nodes.forEach(node => {
        });
        //Creo el visual de los nodos
        this.nodes.forEach(node => {
            // Determinamos el tamaño de los nodos, y si no existen en las opciones, les damos un valor por defecto
            const nodeWidth = this.options?.nodeWidth ? this.options.nodeWidth : 200;
            const nodeHeight = this.options?.nodeHeight ? this.options.nodeHeight : 130;
            // Determinamos las distancias que tendran los nodos entre sí teniendo en cuenta el tamaño pre establecido
            const childDistance = this.options?.childDistance ? (this.options.childDistance + nodeHeight) : (nodeHeight + 50);
            const siblingDistance = this.options?.siblingDistance ? (this.options.siblingDistance + nodeWidth) : (nodeWidth + 100);
            // Obtenemos el padre del elemento mediante el ID del mismo
            const Arrayfather = Array.from(document.getElementsByName('node')).filter(div => {
                if (div.id == node.father) {
                    return div;
                }
            });
            const father = Arrayfather[0]?.parentElement;
            let fatherPositionY = Number(father?.getAttribute('y'));
            fatherPositionY = isNaN(fatherPositionY) ? 0 : fatherPositionY;
            console.log(fatherPositionY);
            const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
            foreignObject.setAttribute('x', `${400 - nodeWidth / 2}`);
            foreignObject.setAttribute('y', `${fatherPositionY + childDistance}`);
            foreignObject.setAttribute('width', `${nodeWidth}`);
            foreignObject.setAttribute('height', `${nodeHeight}`);
            foreignObject.style.padding = '5px';
            const div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
            div.id = node.id;
            div.setAttribute('name', 'node');
            div.textContent = node.name;
            div.title = node.name;
            div.classList.add('defaultNode');
            foreignObject.appendChild(div);
            this.svg.appendChild(foreignObject);
        });
    }
}
let u1 = {
    name: 'Juanchi',
    id: 'general',
    father: '0'
};
let u2 = {
    name: 'María',
    id: 'coronel',
    father: 'general'
};
let u3 = {
    name: 'Lucas',
    id: 'mayor',
    father: 'general'
};
let u4 = {
    name: 'Marcos',
    id: 'cabito',
    father: 'coronel'
};
const options = {
    nodeWidth: 300,
    nodeHeight: 170,
    childDistance: 80,
    siblingDistance: 70,
};
const arraysito = [u1, u2, u3, u4];
const orgTree = new OrgTree('svgCanvas', arraysito);
