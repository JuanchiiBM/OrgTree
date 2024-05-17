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
            this.zoomLevel = Math.min(3, this.zoomLevel + zoomFactor);
        }
        else {
            // Zoom out
            this.zoomLevel = Math.max(0.1, this.zoomLevel - zoomFactor);
        }
        this.viewBox.width = 800 / this.zoomLevel;
        this.viewBox.height = 600 / this.zoomLevel;
        // Calculate new viewBox position to keep the zoom centered
        this.viewBox.x += (prevViewBoxWidth - this.viewBox.width) * scaleX;
        this.viewBox.y += (prevViewBoxHeight - this.viewBox.height) * scaleY;
    }
    // Calcular el número de descendientes de un nodo
    countDescendants(nodeId) {
        const children = this.nodes.filter(node => node.father === nodeId);
        let count = children.length;
        children.forEach(child => {
            count += this.countDescendants(child.id);
        });
        return count;
    }
    loadNodes() {
        const nodeWidth = this.options?.nodeWidth || 200;
        const nodeHeight = this.options?.nodeHeight || 130;
        const childDistance = this.options?.childDistance || 50;
        const siblingDistance = this.options?.siblingDistance || 100;
        const rootNode = this.nodes.find(node => node.father === '');
        if (!rootNode) {
            throw new Error('No se encontró el nodo raíz');
        }
        const positions = {};
        const setPosition = (node, x, y) => {
            positions[node.id] = { x, y };
            const children = this.nodes.filter(n => n.father === node.id);
            if (children.length === 0)
                return;
            let totalDescendants = children.reduce((sum, child) => sum + this.countDescendants(child.id), 0);
            let siblingX = x - ((totalDescendants * (nodeWidth + siblingDistance)) / 2);
            children.forEach((child, index) => {
                const childDescendants = this.countDescendants(child.id);
                const childX = siblingX + (childDescendants * (nodeWidth + siblingDistance)) / 2;
                setPosition(child, childX, y + childDistance + nodeHeight);
                siblingX += (childDescendants + 1) * (nodeWidth + siblingDistance);
            });
        };
        setPosition(rootNode, 400, 0);
        this.nodes.forEach(node => {
            const position = positions[node.id];
            const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
            foreignObject.setAttribute('x', `${position.x}`);
            foreignObject.setAttribute('y', `${position.y}`);
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
const nodes = [
    { name: 'Juanchi', id: '1', father: '' },
    { name: 'María', id: '2', father: '1' },
    { name: 'Lucas', id: '3', father: '1' },
    { name: 'Hijo María', id: '4', father: '2' },
    { name: 'Hijo María', id: '5', father: '2' },
    { name: 'Hijo Lucas', id: '6', father: '3' },
    { name: 'Hijo Lucas', id: '7', father: '3' },
    { name: 'Hijo Lucas', id: '8', father: '3' },
    { name: 'Hijo María', id: '9', father: '2' },
    { name: 'Hijo María', id: '10', father: '2' },
    { name: 'Hijo María', id: '11', father: '2' }
];
const options = {
    nodeWidth: 300,
    nodeHeight: 170,
    childDistance: 80,
    siblingDistance: 70,
};
const orgTree = new OrgTree('svgCanvas', nodes);
