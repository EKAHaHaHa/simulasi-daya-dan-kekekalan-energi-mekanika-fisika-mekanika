import { PhysicsEngine } from './physics.js';

const physics = new PhysicsEngine();

const simCanvas = document.getElementById('simCanvas');
const ctxSim = simCanvas.getContext('2d');
const energyChartCanvas = document.getElementById('energyChart');
const ctxChart = energyChartCanvas.getContext('2d');

const tabSimulasi = document.getElementById('tabSimulasi');
const tabPenyelesaianSoal = document.getElementById('tabPenyelesaianSoal');

const viewSimulasi = document.getElementById('viewSimulasi');
const viewPenyelesaianSoal = document.getElementById('viewPenyelesaianSoal');

const selectSistem = document.getElementById('selectSistem');
const inputMassa = document.getElementById('inputMassa');
const inputGrav = document.getElementById('inputGrav');
const inputV0 = document.getElementById('inputV0');
const inputParam1 = document.getElementById('inputParam1');
const inputParam2 = document.getElementById('inputParam2');
const inputParam3 = document.getElementById('inputParam3');
const inputParam4 = document.getElementById('inputParam4');

const labelParam1 = document.getElementById('labelParam1');
const labelParam2 = document.getElementById('labelParam2');
const labelParam3 = document.getElementById('labelParam3');

const btnPlay = document.getElementById('btnPlay');
const btnReset = document.getElementById('btnReset');
const badgeSistem = document.getElementById('badgeSistem');
const statusAnimasi = document.getElementById('statusAnimasi');

const valTime = document.getElementById('valTime');
const valVelocity = document.getElementById('valVelocity');
const valHeight = document.getElementById('valHeight');
const valEp = document.getElementById('valEp');
const valEk = document.getElementById('valEk');
const valEm = document.getElementById('valEm');
const valW = document.getElementById('valW');
const valPower = document.getElementById('valPower');

const obeFormulasi = document.getElementById('obeFormulasi');
const obeCalculation = document.getElementById('obeCalculation');

const selectMateriSolver = document.getElementById('selectMateriSolver');
const dynamicInputsContainer = document.getElementById('dynamicInputsContainer');
const btnHitungSolver = document.getElementById('btnHitungSolver');
const solverStepByStepResult = document.getElementById('solverStepByStepResult');
const simSyncContainer = document.getElementById('simSyncContainer');
const btnBukaSimulasi = document.getElementById('btnBukaSimulasi');

let chartHistory = [];

function switchTab(activeTab) {
    [tabSimulasi, tabPenyelesaianSoal].forEach(t => t.classList.remove('active'));
    [viewSimulasi, viewPenyelesaianSoal].forEach(v => {
        v.style.display = 'none';
        v.classList.remove('active');
    });

    if (activeTab === 'simulasi') {
        tabSimulasi.classList.add('active');
        viewSimulasi.style.display = 'flex';
        viewSimulasi.classList.add('active');
    } else if (activeTab === 'soal') {
        tabPenyelesaianSoal.classList.add('active');
        viewPenyelesaianSoal.style.display = 'flex';
        viewPenyelesaianSoal.classList.add('active');
        buildDynamicSolverInputs();
    }
}

tabSimulasi.addEventListener('click', () => switchTab('simulasi'));
tabPenyelesaianSoal.addEventListener('click', () => switchTab('soal'));

function buildDynamicInputs() {
    const materi = selectMateriSolver.value;
    let html = '';

    if (materi === 'jatuhBebas') {
        html = `
            <div class="input-row-item"><label>Besaran Ditanyakan:</label><select id="solverTarget"><option value="v">Kecepatan (v)</option><option value="t">Waktu (t)</option><option value="h">Ketinggian / Jarak (h)</option></select></div>
            <div class="input-row-item"><label>Ketinggian awal (h) [m]:</label><input type="number" id="in_h" placeholder="Contoh: 20" step="any"></div>
            <div class="input-row-item"><label>Kecepatan awal (v₀) [m/s]:</label><input type="number" id="in_v0" value="0" step="any"></div>
            <div class="input-row-item"><label>Waktu (t) [s]:</label><input type="number" id="in_t" placeholder="Opsional" step="any"></div>
            <div class="input-row-item"><label>Kecepatan (v) [m/s]:</label><input type="number" id="in_v" placeholder="Opsional" step="any"></div>
            <div class="input-row-item"><label>Gravitasi (g) [m/s²]:</label><input type="number" id="in_g" value="10" step="any"></div>
        `;
    } else if (materi === 'ek') {
        html = `
            <div class="input-row-item"><label>Besaran Ditanyakan:</label><select id="solverTarget"><option value="ek">Energi Kinetik (Ek)</option><option value="m">Massa (m)</option><option value="v">Kecepatan (v)</option></select></div>
            <div class="input-row-item"><label>Massa (m) [kg]:</label><input type="number" id="in_m" placeholder="Contoh: 2" step="any"></div>
            <div class="input-row-item"><label>Kecepatan (v) [m/s]:</label><input type="number" id="in_v" placeholder="Contoh: 10" step="any"></div>
            <div class="input-row-item"><label>Energi Kinetik (Ek) [J]:</label><input type="number" id="in_ek" placeholder="Jika Ek dicari, kosongkan" step="any"></div>
        `;
    } else if (materi === 'ep') {
        html = `
            <div class="input-row-item"><label>Besaran Ditanyakan:</label><select id="solverTarget"><option value="ep">Energi Potensial (Ep)</option><option value="h">Ketinggian (h)</option><option value="m">Massa (m)</option></select></div>
            <div class="input-row-item"><label>Massa (m) [kg]:</label><input type="number" id="in_m" placeholder="Contoh: 2" step="any"></div>
            <div class="input-row-item"><label>Ketinggian (h) [m]:</label><input type="number" id="in_h" placeholder="Contoh: 5" step="any"></div>
            <div class="input-row-item"><label>Gravitasi (g) [m/s²]:</label><input type="number" id="in_g" value="10" step="any"></div>
            <div class="input-row-item"><label>Energi Potensial (Ep) [J]:</label><input type="number" id="in_ep" placeholder="Kosongkan jika dicari" step="any"></div>
        `;
    } else if (materi === 'em') {
        html = `
            <div class="input-row-item"><label>Besaran Ditanyakan:</label><select id="solverTarget"><option value="em">Energi Mekanik (Em)</option><option value="ep">Energi Potensial (Ep)</option><option value="ek">Energi Kinetik (Ek)</option></select></div>
            <div class="input-row-item"><label>Energi Potensial (Ep) [J]:</label><input type="number" id="in_ep" placeholder="Contoh: 60" step="any"></div>
            <div class="input-row-item"><label>Energi Kinetik (Ek) [J]:</label><input type="number" id="in_ek" placeholder="Contoh: 40" step="any"></div>
            <div class="input-row-item"><label>Energi Mekanik (Em) [J]:</label><input type="number" id="in_em" placeholder="Kosongkan jika dicari" step="any"></div>
        `;
    } else if (materi === 'usaha') {
        html = `
            <div class="input-row-item"><label>Besaran Ditanyakan:</label><select id="solverTarget"><option value="w">Usaha (W)</option><option value="f">Gaya (F)</option><option value="s">Perpindahan (s)</option></select></div>
            <div class="input-row-item"><label>Gaya (F) [N]:</label><input type="number" id="in_f" placeholder="Contoh: 50" step="any"></div>
            <div class="input-row-item"><label>Perpindahan (s) [m]:</label><input type="number" id="in_s" placeholder="Contoh: 4" step="any"></div>
            <div class="input-row-item"><label>Sudut gaya (θ) [°]:</label><input type="number" id="in_theta" value="0" step="any"></div>
            <div class="input-row-item"><label>Usaha (W) [J]:</label><input type="number" id="in_w" placeholder="Kosongkan jika dicari" step="any"></div>
        `;
    } else if (materi === 'daya') {
        html = `
            <div class="input-row-item"><label>Besaran Ditanyakan:</label><select id="solverTarget"><option value="p">Daya (P)</option><option value="w">Usaha (W)</option><option value="t">Waktu (t)</option></select></div>
            <div class="input-row-item"><label>Usaha (W) [J]:</label><input type="number" id="in_w" placeholder="Contoh: 200" step="any"></div>
            <div class="input-row-item"><label>Waktu (t) [s]:</label><input type="number" id="in_t" placeholder="Contoh: 10" step="any"></div>
            <div class="input-row-item"><label>Daya (P) [W]:</label><input type="number" id="in_p" placeholder="Kosongkan jika dicari" step="any"></div>
        `;
    } else if (materi === 'bidangMiring') {
        html = `
            <div class="input-row-item"><label>Besaran Ditanyakan:</label><select id="solverTarget"><option value="h">Tinggi Vertikal (h)</option><option value="a">Perc. Benda (a)</option></select></div>
            <div class="input-row-item"><label>Panjang Lintasan (L) [m]:</label><input type="number" id="in_l" placeholder="Contoh: 10" step="any"></div>
            <div class="input-row-item"><label>Sudut (θ) [°]:</label><input type="number" id="in_theta" placeholder="Contoh: 30" step="any"></div>
            <div class="input-row-item"><label>Massa (m) [kg]:</label><input type="number" id="in_m" value="2" step="any"></div>
            <div class="input-row-item"><label>Koefisien Gesek (µ):</label><input type="number" id="in_mu" value="0.1" step="any"></div>
            <div class="input-row-item"><label>Gravitasi (g) [m/s²]:</label><input type="number" id="in_g" value="10" step="any"></div>
        `;
    } else if (materi === 'bandul') {
        html = `
            <div class="input-row-item"><label>Besaran Ditanyakan:</label><select id="solverTarget"><option value="periode">Periode (T)</option></select></div>
            <div class="input-row-item"><label>Panjang Tali (L) [m]:</label><input type="number" id="in_l" placeholder="Contoh: 1" step="any"></div>
            <div class="input-row-item"><label>Gravitasi (g) [m/s²]:</label><input type="number" id="in_g" value="10" step="any"></div>
        `;
    } else if (materi === 'angkatBeban') {
        html = `
            <div class="input-row-item"><label>Besaran Ditanyakan:</label><select id="solverTarget"><option value="w">Usaha (W)</option><option value="p">Daya Rata-rata (P)</option></select></div>
            <div class="input-row-item"><label>Massa (m) [kg]:</label><input type="number" id="in_m" placeholder="Contoh: 10" step="any"></div>
            <div class="input-row-item"><label>Ketinggian (h) [m]:</label><input type="number" id="in_h" placeholder="Contoh: 5" step="any"></div>
            <div class="input-row-item"><label>Waktu (t) [s]:</label><input type="number" id="in_t" placeholder="Contoh: 10" step="any"></div>
            <div class="input-row-item"><label>Gravitasi (g) [m/s²]:</label><input type="number" id="in_g" value="10" step="any"></div>
        `;
    }

    dynamicInputsContainer.innerHTML = html;
}

function buildDynamicSolverInputs() {
    buildDynamicInputs();
}

selectMateriSolver.addEventListener('change', buildDynamicInputs);

btnHitungSolver.addEventListener('click', () => {
    const materi = selectMateriSolver.value;
    const targetElem = document.getElementById('solverTarget');
    const target = targetElem ? targetElem.value : '';

    const inputs = {
        target: target,
        h: document.getElementById('in_h') ? document.getElementById('in_h').value : undefined,
        v0: document.getElementById('in_v0') ? document.getElementById('in_v0').value : undefined,
        t: document.getElementById('in_t') ? document.getElementById('in_t').value : undefined,
        v: document.getElementById('in_v') ? document.getElementById('in_v').value : undefined,
        g: document.getElementById('in_g') ? document.getElementById('in_g').value : undefined,
        m: document.getElementById('in_m') ? document.getElementById('in_m').value : undefined,
        ek: document.getElementById('in_ek') ? document.getElementById('in_ek').value : undefined,
        ep: document.getElementById('in_ep') ? document.getElementById('in_ep').value : undefined,
        em: document.getElementById('in_em') ? document.getElementById('in_em').value : undefined,
        f: document.getElementById('in_f') ? document.getElementById('in_f').value : undefined,
        s: document.getElementById('in_s') ? document.getElementById('in_s').value : undefined,
        theta: document.getElementById('in_theta') ? document.getElementById('in_theta').value : undefined,
        w: document.getElementById('in_w') ? document.getElementById('in_w').value : undefined,
        p: document.getElementById('in_p') ? document.getElementById('in_p').value : undefined,
        l: document.getElementById('in_l') ? document.getElementById('in_l').value : undefined,
        mu: document.getElementById('in_mu') ? document.getElementById('in_mu').value : undefined
    };

    const res = physics.solveCustomProblem(materi, inputs);

    let htmlResult = `
        <b>1. Diketahui:</b><br>
        ${res.diketahuiText.map(d => `&nbsp;&nbsp;• ${d}`).join('<br>')}<br><br>
        <b>2. Ditanyakan:</b><br>
        &nbsp;&nbsp;• ${res.ditanyakan}<br><br>
        <b>3. Rumus Dasar:</b><br>
        &nbsp;&nbsp;<code>${res.formulasi}</code><br><br>
        <b>4. Langkah Perhitungan:</b><br>
        ${res.langkahPerhitungan.map(lp => `&nbsp;&nbsp;→ ${lp}`).join('<br>')}<br><br>
        <b>5. Hasil Akhir:</b><br>
        &nbsp;&nbsp;<b>🎯 ${res.hasilAkhir}</b><br><br>
        <b>6. Kesimpulan:</b><br>
        &nbsp;&nbsp;💡 <i>${res.kesimpulan}</i>
    `;

    solverStepByStepResult.innerHTML = htmlResult;
    simSyncContainer.style.display = "block";
});

btnBukaSimulasi.addEventListener('click', () => {
    switchTab('simulasi');
});

function updateFormLabels() {
    const sys = selectSistem.value;
    document.getElementById('groupParam2').style.display = "flex";
    document.getElementById('groupParam3').style.display = "flex";
    document.getElementById('groupParam4').style.display = "none";

    if (sys === "jatuhBebas") {
        badgeSistem.innerText = "Gerak Jatuh Bebas";
        labelParam1.innerText = "Ketinggian Awal (h₀) [m]:";
        document.getElementById('groupParam2').style.display = "none";
        document.getElementById('groupParam3').style.display = "none";
    } else if (sys === "bidangMiringGesek") {
        badgeSistem.innerText = "Bidang Miring + Gesekan";
        labelParam1.innerText = "Panjang Lintasan (L) [m]:";
        labelParam2.innerText = "Sudut Kemiringan (θ) [°]:";
        labelParam3.innerText = "Koefisien Gesek (µ):";
    } else if (sys === "bandul") {
        badgeSistem.innerText = "Bandul Sederhana";
        labelParam1.innerText = "Panjang Tali (L) [m]:";
        labelParam2.innerText = "Simpangan Awal (θ₀) [°]:";
        document.getElementById('groupParam3').style.display = "none";
    } else if (sys === "angkatBeban") {
        badgeSistem.innerText = "Mengangkat Beban";
        labelParam1.innerText = "Ketinggian Target (h) [m]:";
        document.getElementById('groupParam2').style.display = "none";
        document.getElementById('groupParam3').style.display = "none";
        document.getElementById('groupParam4').style.display = "flex";
    }

    syncParameters(true);
}

function syncParameters(resetPos = false) {
    const sys = selectSistem.value;
    const m = parseFloat(inputMassa.value);
    const g = parseFloat(inputGrav.value);
    const v0 = parseFloat(inputV0.value);
    const p1 = parseFloat(inputParam1.value);
    const p2 = parseFloat(inputParam2.value);
    const p3 = parseFloat(inputParam3.value);
    const p4 = parseFloat(inputParam4.value);

    physics.setConfiguration(sys, m, g, v0, p1, p2, p3, p4);

    if (resetPos) {
        chartHistory = [];
        const initialState = physics.getStateAtTime(0);
        renderSimulation(initialState);
        renderChart();
        updateOBEFormulation();
    }
}

selectSistem.addEventListener('change', updateFormLabels);
[inputMassa, inputGrav, inputV0, inputParam1, inputParam2, inputParam3, inputParam4].forEach(elem => {
    if (elem) elem.addEventListener('input', () => syncParameters(true));
});

btnPlay.addEventListener('click', () => {
    physics.isRunning = !physics.isRunning;
    btnPlay.innerText = physics.isRunning ? "⏸️ Pause" : "▶️ Mulai / Pause";
});

btnReset.addEventListener('click', () => {
    physics.isRunning = false;
    btnPlay.innerText = "▶️ Mulai / Pause";
    syncParameters(true);
});

function updateOBEFormulation() {
    const sys = selectSistem.value;
    let html = "";
    if (sys === "jatuhBebas") {
        html = `• <b>Ep = m · g · h</b> | <b>Ek = ½ · m · v²</b> | <b>Em = Ep + Ek (Konstan)</b>`;
    } else if (sys === "bidangMiringGesek") {
        html = `• <b>h = L · sin(θ)</b> | <b>f_k = µ · m · g · cos(θ)</b> | <b>W_gesek = f_k · s</b>`;
    } else if (sys === "bandul") {
        html = `• <b>T = 2π · √(L/g)</b> | <b>h = L(1 - cos θ)</b>`;
    } else if (sys === "angkatBeban") {
        html = `• <b>W = m · g · h</b> | <b>P = W / t</b>`;
    }
    obeFormulasi.innerHTML = html;
}

function renderSimulation(state) {
    ctxSim.clearRect(0, 0, simCanvas.width, simCanvas.height);
    const meta = state.canvasMeta;
    if (!meta) return;

    if (meta.type === "jatuhBebas") {
        const groundY = 360, topY = 60;
        const maxH = meta.maxH || 10;
        const scale = (groundY - topY) / maxH;
        const ballY = groundY - state.height * scale;
        const ballX = simCanvas.width / 2;

        ctxSim.fillStyle = '#64748b';
        ctxSim.fillRect(100, groundY, simCanvas.width - 200, 15);

        ctxSim.beginPath();
        ctxSim.arc(ballX, ballY, 16, 0, Math.PI * 2);
        ctxSim.fillStyle = '#e67e22';
        ctxSim.fill();
        ctxSim.stroke();

        if (state.velocity > 0) {
            drawArrow(ctxSim, ballX, ballY, ballX, ballY + Math.min(60, state.velocity * 3), '#e74c3c', `v = ${state.velocity.toFixed(1)} m/s`);
        }
    } else if (meta.type === "bidangMiringGesek") {
        const startX = 80, startY = 100;
        const thetaRad = (meta.theta * Math.PI) / 180;
        const screenLen = 380;
        const endX = startX + screenLen * Math.cos(thetaRad);
        const endY = startY + screenLen * Math.sin(thetaRad);

        ctxSim.beginPath();
        ctxSim.moveTo(startX, startY);
        ctxSim.lineTo(endX, endY);
        ctxSim.lineTo(endX, 360);
        ctxSim.lineTo(startX, 360);
        ctxSim.closePath();
        ctxSim.fillStyle = '#f1f5f9';
        ctxSim.fill();
        ctxSim.strokeStyle = '#334155';
        ctxSim.lineWidth = 3;
        ctxSim.stroke();

        const ratio = Math.min(1, meta.dist / meta.length);
        const objX = startX + (endX - startX) * ratio;
        const objY = startY + (endY - startY) * ratio;

        ctxSim.save();
        ctxSim.translate(objX, objY);
        ctxSim.rotate(thetaRad);
        ctxSim.fillStyle = '#e74c3c';
        ctxSim.fillRect(-15, -20, 30, 20);
        ctxSim.strokeRect(-15, -20, 30, 20);
        ctxSim.restore();

        drawArrow(ctxSim, objX, objY, objX, objY + 45, '#2980b9', 'Fg');
        drawArrow(ctxSim, objX, objY, objX - 35 * Math.sin(thetaRad), objY - 35 * Math.cos(thetaRad), '#27ae60', 'FN');
        if (meta.fk > 0) {
            drawArrow(ctxSim, objX, objY, objX - 30 * Math.cos(thetaRad), objY - 30 * Math.sin(thetaRad), '#c0392b', 'fk');
        }
    } else if (meta.type === "bandul") {
        const pivotX = simCanvas.width / 2, pivotY = 70;
        const scaleL = 220;
        const bobX = pivotX + scaleL * Math.sin(meta.angleRad);
        const bobY = pivotY + scaleL * Math.cos(meta.angleRad);

        ctxSim.fillStyle = '#475569';
        ctxSim.fillRect(pivotX - 40, pivotY - 10, 80, 10);

        ctxSim.strokeStyle = '#1e293b';
        ctxSim.lineWidth = 2;
        ctxSim.beginPath();
        ctxSim.moveTo(pivotX, pivotY);
        ctxSim.lineTo(bobX, bobY);
        ctxSim.stroke();

        ctxSim.beginPath();
        ctxSim.arc(bobX, bobY, 18, 0, Math.PI * 2);
        ctxSim.fillStyle = '#3498db';
        ctxSim.fill();
        ctxSim.stroke();
    } else if (meta.type === "angkatBeban") {
        const groundY = 360, topY = 80;
        const maxH = meta.maxH || 10;
        const scale = (groundY - topY) / maxH;
        const boxY = groundY - state.height * scale;
        const boxX = simCanvas.width / 2;

        ctxSim.strokeStyle = '#94a3b8';
        ctxSim.lineWidth = 3;
        ctxSim.beginPath();
        ctxSim.moveTo(boxX, 30);
        ctxSim.lineTo(boxX, boxY);
        ctxSim.stroke();

        ctxSim.fillStyle = '#8e44ad';
        ctxSim.fillRect(boxX - 25, boxY - 25, 50, 50);
        ctxSim.strokeRect(boxX - 25, boxY - 25, 50, 50);

        drawArrow(ctxSim, boxX, boxY - 25, boxX, boxY - 65, '#27ae60', `F = ${meta.F.toFixed(1)} N`);
    }

    valTime.innerText = `${state.time.toFixed(2)} s`;
    valVelocity.innerText = `${state.velocity.toFixed(2)} m/s`;
    valHeight.innerText = `${state.height.toFixed(2)} m`;
    valEp.innerText = `${state.Ep.toFixed(2)} J`;
    valEk.innerText = `${state.Ek.toFixed(2)} J`;
    valEm.innerText = `${state.Em.toFixed(2)} J`;
    valW.innerText = `${state.W.toFixed(2)} J`;
    valPower.innerText = `${state.Power.toFixed(2)} W`;

    statusAnimasi.innerText = state.isFinished ? "🏁 Simulasi Selesai" : (physics.isRunning ? "▶️ Simulasi Berjalan..." : "⏸️ Pause");

    obeCalculation.innerHTML = `
        • <b>Ep:</b> ${physics.m} × ${physics.g} × ${state.height.toFixed(2)} = <b>${state.Ep.toFixed(2)} J</b><br>
        • <b>Ek:</b> 0.5 × ${physics.m} × (${state.velocity.toFixed(2)})² = <b>${state.Ek.toFixed(2)} J</b><br>
        • <b>Em Total:</b> ${state.Ep.toFixed(2)} + ${state.Ek.toFixed(2)} = <b>${state.Em.toFixed(2)} J</b>
    `;

    if (physics.isRunning) {
        chartHistory.push({ t: state.time, Ep: state.Ep, Ek: state.Ek, Em: state.Em });
        if (chartHistory.length > 200) chartHistory.shift();
    }
}

function drawArrow(ctx, fromX, fromY, toX, toY, color, label) {
    const headlen = 8;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    if (label) {
        ctx.font = '11px sans-serif';
        ctx.fillText(label, toX + 5, toY);
    }
}

function renderChart() {
    ctxChart.clearRect(0, 0, energyChartCanvas.width, energyChartCanvas.height);
    const w = energyChartCanvas.width;
    const h = energyChartCanvas.height;
    const pad = 30;

    ctxChart.strokeStyle = '#e2e8f0';
    ctxChart.lineWidth = 1;
    ctxChart.beginPath();
    ctxChart.moveTo(pad, pad);
    ctxChart.lineTo(pad, h - pad);
    ctxChart.lineTo(w - pad, h - pad);
    ctxChart.stroke();

    if (chartHistory.length < 2) return;

    const maxT = Math.max(5, chartHistory[chartHistory.length - 1].t);
    const maxE = Math.max(10, ...chartHistory.map(d => d.Em));

    function getX(t) { return pad + (t / maxT) * (w - 2 * pad); }
    function getY(e) { return (h - pad) - (e / maxE) * (h - 2 * pad); }

    drawLine(chartHistory.map(d => ({ x: getX(d.t), y: getY(d.Ep) })), '#3498db');
    drawLine(chartHistory.map(d => ({ x: getX(d.t), y: getY(d.Ek) })), '#e67e22');
    drawLine(chartHistory.map(d => ({ x: getX(d.t), y: getY(d.Em) })), '#2ecc71');
}

function drawLine(points, color) {
    ctxChart.strokeStyle = color;
    ctxChart.lineWidth = 2;
    ctxChart.beginPath();
    points.forEach((pt, i) => {
        if (i === 0) ctxChart.moveTo(pt.x, pt.y);
        else ctxChart.lineTo(pt.x, pt.y);
    });
    ctxChart.stroke();
}

let lastTime = performance.now();
function mainLoop(currentTime) {
    let dt = (currentTime - lastTime) / 1000.0;
    if (dt > 0.1) dt = 0.016;
    lastTime = currentTime;

    const state = physics.update(dt);
    renderSimulation(state);
    renderChart();

    requestAnimationFrame(mainLoop);
}

updateFormLabels();
requestAnimationFrame(mainLoop);