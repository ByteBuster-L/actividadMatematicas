const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Nodos del DOM
const sliderM = document.getElementById("sliderM");
const inputM = document.getElementById("inputM");
const txtV = document.getElementById("valV");
const txtLitros = document.getElementById("valLitros");
// Referencias para el Panel Matemático
const procM1 = document.getElementById("procM1");
const procX = document.getElementById("procX");
const procY = document.getElementById("procY");
const procV = document.getElementById("procV");

// Variables globales
let base, paredFrente, paredAtras, paredIzq, paredDer, aguaMesh;
// Referencias a los textos 3D
let textoBase, textoAltura;

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.08, 0.08, 0.1, 1); 

    // Cámara (Ajustada para pantalla completa)
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 4, Math.PI / 3, 12, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.wheelPrecision = 50; // Zoom más suave

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // --- EL PISO ---
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 100, height: 100}, scene);
    const gridMat = new BABYLON.GridMaterial("grid", scene);
    gridMat.mainColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    gridMat.lineColor = new BABYLON.Color3(0.2, 0.2, 0.3);
    gridMat.majorUnitFrequency = 5;
    gridMat.gridRatio = 1;
    gridMat.opacity = 0.4;
    ground.material = gridMat;
    ground.position.y = -0.01;

    // --- MATERIALES CISTERNA ---
    const matCisterna = new BABYLON.StandardMaterial("matCisterna", scene);
    matCisterna.diffuseColor = new BABYLON.Color3(0.5, 0.7, 1.0);
    matCisterna.alpha = 0.3; 
    matCisterna.backFaceCulling = false;

    const matAgua = new BABYLON.StandardMaterial("matAgua", scene);
    matAgua.diffuseColor = new BABYLON.Color3(0.1, 0.4, 0.8);
    matAgua.alpha = 0.7;
    matAgua.backFaceCulling = false;

    // --- CONSTRUCCIÓN (Mallas) ---
    const cisternaNode = new BABYLON.TransformNode("cisternaNode");

    base = BABYLON.MeshBuilder.CreatePlane("base", {size: 1}, scene);
    base.material = matCisterna;
    base.rotation.x = Math.PI / 2;
    base.parent = cisternaNode;

    paredFrente = BABYLON.MeshBuilder.CreatePlane("paredFrente", {size: 1}, scene);
    paredFrente.material = matCisterna;
    paredFrente.parent = cisternaNode;

    paredAtras = BABYLON.MeshBuilder.CreatePlane("paredAtras", {size: 1}, scene);
    paredAtras.material = matCisterna;
    paredAtras.parent = cisternaNode;

    paredIzq = BABYLON.MeshBuilder.CreatePlane("paredIzq", {size: 1}, scene);
    paredIzq.material = matCisterna;
    paredIzq.rotation.y = Math.PI / 2;
    paredIzq.parent = cisternaNode;

    paredDer = BABYLON.MeshBuilder.CreatePlane("paredDer", {size: 1}, scene);
    paredDer.material = matCisterna;
    paredDer.rotation.y = Math.PI / 2;
    paredDer.parent = cisternaNode;

    aguaMesh = BABYLON.MeshBuilder.CreatePlane("agua", {size: 1}, scene);
    aguaMesh.material = matAgua;
    aguaMesh.rotation.x = Math.PI / 2;
    aguaMesh.parent = cisternaNode;

    // Habilitar bordes para ese look técnico
    scene.meshes.forEach(mesh => {
        if (mesh.name !== "ground" && mesh.name !== "agua") {
            mesh.enableEdgesRendering();
            mesh.edgesWidth = 3.0;
            mesh.edgesColor = new BABYLON.Color4(1, 1, 1, 0.8);
        }
    });

    // --- UI FLOTANTE EN 3D (GUI) ---
    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // Función auxiliar para crear etiquetas limpias
    const crearEtiqueta = (texto) => {
        const rect = new BABYLON.GUI.Rectangle();
        rect.width = "100px";
        rect.height = "35px";
        rect.cornerRadius = 5;
        rect.color = "#64b5f6";
        rect.thickness = 1;
        rect.background = "rgba(18, 18, 18, 0.8)";
        
        const label = new BABYLON.GUI.TextBlock();
        label.text = texto;
        label.color = "white";
        label.fontSize = 14;
        label.fontWeight = "bold";
        rect.addControl(label);
        
        advancedTexture.addControl(rect);
        return { contenedor: rect, texto: label };
    };

    // Creamos las etiquetas
    const uiBase = crearEtiqueta("Base: 0m");
    const uiAltura = crearEtiqueta("Alt: 0m");

    // Guardamos referencia global al texto para actualizarlo luego
    textoBase = uiBase.texto;
    textoAltura = uiAltura.texto;

    // MAGIA: Anclamos las etiquetas a las mallas correspondientes.
    // La base está en el piso, la pared derecha nos sirve para la altura.
    uiBase.contenedor.linkWithMesh(base);
    uiAltura.contenedor.linkWithMesh(paredDer);
    
    // Offset para que la etiqueta de la pared no quede enterrada en el centro
    uiAltura.contenedor.linkOffsetY = -30; 

    return scene;
};

const scene = createScene();

const actualizarCisterna = () => {
    // Obtenemos el valor (puede venir del input o del slider)
    const M = parseFloat(inputM.value) || 12; // Fallback de seguridad
    
    // Fórmulas matemáticas
    const x = Math.sqrt(M / 3);
    const y = (M - Math.pow(x, 2)) / (4 * x);
    const V = Math.pow(x, 2) * y;
    const Litros = V * 1000; // 1 m³ = 1000 Litros

    // 1. Actualizar Panel HTML
    txtV.innerText = V.toFixed(2);
    // Formatear los litros con comas para que se lea mejor (ej. 4,000)
    txtLitros.innerText = Litros.toLocaleString(undefined, { maximumFractionDigits: 0 });

    document.getElementById("procX").innerText = x.toFixed(2);
    document.getElementById("procY").innerText = y.toFixed(2);
    document.getElementById("procV").innerText = V.toFixed(2);

    // Reemplazo dinámico de la variable M en TODOS los pasos (1, 2 y 3)
    const valorM = M.toFixed(2);             // Ej: 12.00
    const valorM4 = (M / 4).toFixed(2);      // Ej: 3.00
    const valorM3 = (M / 3).toFixed(2);      // Ej: 4.00
    const valorX = x.toFixed(2);
    
    // Esto buscará todas las M en el texto y las cambiará por el valor del slider al instante
   document.querySelectorAll('.val-m').forEach(el => el.innerText = valorM);
    document.querySelectorAll('.val-m4').forEach(el => el.innerText = valorM4);
    document.querySelectorAll('.val-m3').forEach(el => el.innerText = valorM3);
    document.querySelectorAll('.val-x').forEach(el => el.innerText = valorX);

    // 2. Actualizar Textos en el Mundo 3D
    if (textoBase && textoAltura) {
        textoBase.text = `X: ${x.toFixed(2)}m`;
        textoAltura.text = `Y: ${y.toFixed(2)}m`;
    }

    // 3. Actualizar Geometría 3D
    if (base) {
        base.scaling.x = x;
        base.scaling.y = x;

        paredFrente.scaling.x = x;
        paredFrente.scaling.y = y;
        paredFrente.position.z = -x / 2;
        paredFrente.position.y = y / 2;

        paredAtras.scaling.x = x;
        paredAtras.scaling.y = y;
        paredAtras.position.z = x / 2;
        paredAtras.position.y = y / 2;

        paredIzq.scaling.x = x;
        paredIzq.scaling.y = y;
        paredIzq.position.x = -x / 2;
        paredIzq.position.y = y / 2;

        paredDer.scaling.x = x;
        paredDer.scaling.y = y;
        paredDer.position.x = x / 2;
        paredDer.position.y = y / 2;

        aguaMesh.scaling.x = x - 0.01;
        aguaMesh.scaling.y = x - 0.01;
        aguaMesh.position.y = (y * 0.90);
    }
};

// --- SINCRONIZACIÓN DE INPUTS ---
const sincronizarValores = (evento) => {
    let valor = evento.target.value;
    
    // Limitamos por seguridad para que la cisterna no se rompa o se haga negativa
    if(valor < 1) valor = 1;
    if(valor > 1000) valor = 1000;

    sliderM.value = valor;
    inputM.value = valor;
    
    actualizarCisterna();
};

// Ambos controles disparan la misma función
sliderM.addEventListener("input", sincronizarValores);
inputM.addEventListener("input", sincronizarValores);
// Para el input numérico, también reaccionamos cuando el usuario teclea y pierde el foco
inputM.addEventListener("change", sincronizarValores);


engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener("resize", () => {
    engine.resize();
});

// Llamada inicial para arrancar con M = 12
actualizarCisterna();