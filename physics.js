export class PhysicsEngine {
    constructor() {
        this.sistem = "jatuhBebas";
        this.m = 2.0;
        this.g = 10.0;
        this.v0 = 0.0;
        this.param1 = 10.0;
        this.param2 = 30.0;
        this.param3 = 0.15;
        this.param4 = 5.0;

        this.time = 0;
        this.maxTime = 5;
        this.isRunning = false;

        this.resetState();
    }

    setConfiguration(sistem, m, g, v0, p1, p2, p3, p4) {
        this.sistem = sistem;
        this.m = (isNaN(m) || m <= 0) ? 1.0 : m;
        this.g = (isNaN(g) || g < 0) ? 10.0 : g;
        this.v0 = (isNaN(v0) || v0 < 0) ? 0.0 : v0;
        this.param1 = (isNaN(p1) || p1 <= 0) ? 5.0 : p1;
        this.param2 = isNaN(p2) ? 30.0 : p2;
        this.param3 = (isNaN(p3) || p3 < 0) ? 0.0 : p3;
        this.param4 = (isNaN(p4) || p4 <= 0) ? 5.0 : p4;

        this.resetState();
    }

    resetState() {
        this.time = 0;
        this.isRunning = false;
        this.calculateMaxTime();
    }

    calculateMaxTime() {
        if (this.sistem === "jatuhBebas") {
            const h0 = this.param1;
            const a = 0.5 * this.g;
            const b = this.v0;
            const c = -h0;
            const D = b * b - 4 * a * c;
            this.maxTime = D >= 0 ? (-b + Math.sqrt(D)) / (2 * a) : 5;
        } else if (this.sistem === "bidangMiringGesek") {
            const L = this.param1;
            const thetaRad = (this.param2 * Math.PI) / 180;
            const mu = this.param3;
            
            const gSin = this.g * Math.sin(thetaRad);
            const gCos = this.g * Math.cos(thetaRad);
            const a_net = gSin - mu * gCos;

            if (a_net <= 0 && this.v0 === 0) {
                this.maxTime = 5;
            } else {
                const a = 0.5 * Math.max(0, a_net);
                const b = this.v0;
                const c = -L;
                if (a === 0) {
                    this.maxTime = b > 0 ? L / b : 5;
                } else {
                    const D = b * b - 4 * a * c;
                    this.maxTime = D >= 0 ? (-b + Math.sqrt(D)) / (2 * a) : 5;
                }
            }
        } else if (this.sistem === "bandul") {
            const L = this.param1;
            this.maxTime = 2 * Math.PI * Math.sqrt(L / (this.g || 9.8));
        } else if (this.sistem === "angkatBeban") {
            this.maxTime = this.param4;
        }
    }

    update(dt) {
        if (!this.isRunning) return this.getStateAtTime(this.time);

        this.time += dt;
        if (this.time >= this.maxTime) {
            this.time = this.maxTime;
            this.isRunning = false;
        }

        return this.getStateAtTime(this.time);
    }

    getStateAtTime(t) {
        let clampedT = Math.max(0, Math.min(t, this.maxTime));
        let h = 0, v = 0, Ep = 0, Ek = 0, Em = 0, W = 0, Power = 0;
        let canvasMeta = {};

        if (this.sistem === "jatuhBebas") {
            const h0 = this.param1;
            h = Math.max(0, h0 - (this.v0 * clampedT + 0.5 * this.g * (clampedT ** 2)));
            v = this.v0 + this.g * clampedT;

            Ep = this.m * this.g * h;
            Ek = 0.5 * this.m * (v ** 2);
            Em = Ep + Ek;

            const displacement = h0 - h;
            const F = this.m * this.g;
            W = F * displacement;
            Power = clampedT > 0 ? W / clampedT : 0;

            canvasMeta = { type: "jatuhBebas", h, maxH: h0 };

        } else if (this.sistem === "bidangMiringGesek") {
            const L = this.param1;
            const thetaDeg = Math.min(89, Math.max(1, this.param2));
            const mu = this.param3;
            const thetaRad = (thetaDeg * Math.PI) / 180;

            const gSin = this.g * Math.sin(thetaRad);
            const gCos = this.g * Math.cos(thetaRad);
            const a_net = Math.max(0, gSin - mu * gCos);

            let s = this.v0 * clampedT + 0.5 * a_net * (clampedT ** 2);
            if (s > L) s = L;

            v = Math.sqrt(this.v0 ** 2 + 2 * a_net * s);
            const h0 = L * Math.sin(thetaRad);
            h = Math.max(0, h0 - s * Math.sin(thetaRad));

            Ep = this.m * this.g * h;
            Ek = 0.5 * this.m * (v ** 2);
            Em = Ep + Ek;

            const F_netto = this.m * a_net;
            W = F_netto * s;
            Power = clampedT > 0 ? W / clampedT : 0;

            const Fg = this.m * this.g;
            const FN = Fg * Math.cos(thetaRad);
            const fk = mu * FN;

            canvasMeta = {
                type: "bidangMiringGesek",
                length: L,
                theta: thetaDeg,
                dist: s,
                Fg, FN, fk, a_net
            };

        } else if (this.sistem === "bandul") {
            const L = this.param1;
            const maxThetaDeg = Math.min(80, this.param2);
            const thetaMaxRad = (maxThetaDeg * Math.PI) / 180;

            const omega = Math.sqrt(this.g / L);
            const angle = thetaMaxRad * Math.cos(omega * clampedT);
            const thetaDot = -omega * thetaMaxRad * Math.sin(omega * clampedT);
            v = L * Math.abs(thetaDot);

            h = L * (1 - Math.cos(angle));
            Ep = this.m * this.g * h;
            Ek = 0.5 * this.m * (v ** 2);
            Em = Ep + Ek;

            W = Ek;
            Power = clampedT > 0 ? W / clampedT : 0;

            canvasMeta = { type: "bandul", L, angleRad: angle, maxThetaDeg };

        } else if (this.sistem === "angkatBeban") {
            const targetH = this.param1;
            const totalT = this.param4;
            
            const constV = targetH / totalT;
            h = Math.min(targetH, constV * clampedT);
            v = clampedT >= totalT ? 0 : constV;

            Ep = this.m * this.g * h;
            Ek = 0.5 * this.m * (v ** 2);
            Em = Ep + Ek;

            const F = this.m * this.g;
            W = F * h;
            Power = clampedT > 0 ? W / clampedT : 0;

            canvasMeta = { type: "angkatBeban", h, maxH: targetH, F };
        }

        return {
            time: clampedT,
            maxTime: this.maxTime,
            height: h,
            velocity: v,
            Ep, Ek, Em, W, Power,
            isFinished: clampedT >= this.maxTime,
            canvasMeta
        };
    }

    solveCustomProblem(materi, inputs) {
        let res = {
            diketahuiText: [],
            ditanyakan: "",
            formulasi: "",
            langkahPerhitungan: [],
            hasilAkhir: "",
            kesimpulan: ""
        };

        const getVal = (key) => parseFloat(inputs[key]);

        switch (materi) {
            case "jatuhBebas": {
                const h = getVal('h');
                const g = getVal('g') || 10.0;
                const v0 = getVal('v0') !== undefined ? getVal('v0') : 0;
                const t = getVal('t');
                const v = getVal('v');
                const target = inputs.target;

                if (target === 'v') {
                    res.ditanyakan = "Kecepatan akhir (v)";
                    if (!isNaN(t)) {
                        res.formulasi = "v = v₀ + g × t";
                        res.diketahuiText = [`v₀ = ${v0} m/s`, `g = ${g} m/s²`, `t = ${t} s`];
                        const val = v0 + g * t;
                        res.langkahPerhitungan = [`v = ${v0} + (${g} × ${t})`, `v = ${v0} + ${g*t}`];
                        res.hasilAkhir = `${val.toFixed(2)} m/s`;
                        res.kesimpulan = `Kecepatan benda setelah ${t} detik adalah ${val.toFixed(2)} m/s.`;
                    } else if (!isNaN(h)) {
                        res.formulasi = "v² = v₀² + 2 × g × h  =>  v = √(v₀² + 2gh)";
                        res.diketahuiText = [`v₀ = ${v0} m/s`, `g = ${g} m/s²`, `h = ${h} m`];
                        const val = Math.sqrt(v0**2 + 2 * g * h);
                        res.langkahPerhitungan = [`v = √(${v0}² + 2 × ${g} × ${h})`, `v = √(${v0**2} + ${2*g*h}) = √(${v0**2 + 2*g*h})`];
                        res.hasilAkhir = `${val.toFixed(2)} m/s`;
                        res.kesimpulan = `Kecepatan benda saat mencapai ketinggian/jarak jatuh ${h} meter adalah ${val.toFixed(2)} m/s.`;
                    }
                } else if (target === 't') {
                    res.ditanyakan = "Waktu jatuh (t)";
                    if (!isNaN(v) && !isNaN(g)) {
                        res.formulasi = "t = (v - v₀) / g";
                        res.diketahuiText = [`v = ${v} m/s`, `v₀ = ${v0} m/s`, `g = ${g} m/s²`];
                        const val = (v - v0) / g;
                        res.langkahPerhitungan = [`t = (${v} - ${v0}) / ${g}`, `t = ${v - v0} / ${g}`];
                        res.hasilAkhir = `${val.toFixed(2)} sekon`;
                        res.kesimpulan = `Waktu yang dibutuhkan untuk mencapai kecepatan tersebut adalah ${val.toFixed(2)} sekon.`;
                    } else if (!isNaN(h) && !isNaN(g)) {
                        res.formulasi = "h = v₀t + ½gt²  =>  t = √(2h / g) (jika v₀=0)";
                        res.diketahuiText = [`h = ${h} m`, `v₀ = ${v0} m/s`, `g = ${g} m/s²`];
                        const val = Math.sqrt((2 * h) / g);
                        res.langkahPerhitungan = [`t = √(2 × ${h} / ${g})`, `t = √(${2*h} / ${g}) = √(${((2*h)/g).toFixed(2)})`];
                        res.hasilAkhir = `${val.toFixed(2)} sekon`;
                        res.kesimpulan = `Waktu jatuh benda dari ketinggian ${h} meter adalah ${val.toFixed(2)} sekon.`;
                    }
                } else if (target === 'h') {
                    res.ditanyakan = "Ketinggian / Jarak Jatuh (h)";
                    if (!isNaN(t) && !isNaN(g)) {
                        res.formulasi = "h = v₀t + ½gt²";
                        res.diketahuiText = [`v₀ = ${v0} m/s`, `t = ${t} s`, `g = ${g} m/s²`];
                        const val = v0 * t + 0.5 * g * (t ** 2);
                        res.langkahPerhitungan = [`h = (${v0} × ${t}) + (0.5 × ${g} × ${t}²)`, `h = ${v0*t} + ${0.5*g*(t**2)}`];
                        res.hasilAkhir = `${val.toFixed(2)} meter`;
                        res.kesimpulan = `Ketinggian/jarak tempuh benda selama ${t} detik adalah ${val.toFixed(2)} meter.`;
                    }
                }
                break;
            }

            case "ek": {
                const m = getVal('m');
                const v = getVal('v');
                const ek = getVal('ek');
                const target = inputs.target;

                if (target === 'ek') {
                    res.ditanyakan = "Energi Kinetik (Ek)";
                    res.formulasi = "Ek = ½ × m × v²";
                    res.diketahuiText = [`m = ${m} kg`, `v = ${v} m/s`];
                    const val = 0.5 * m * (v ** 2);
                    res.langkahPerhitungan = [`Ek = 0.5 × ${m} × (${v})²`, `Ek = 0.5 × ${m} × ${v**2}`];
                    res.hasilAkhir = `${val.toFixed(2)} Joule`;
                    res.kesimpulan = `Energi kinetik benda adalah ${val.toFixed(2)} Joule.`;
                } else if (target === 'm') {
                    res.ditanyakan = "Massa benda (m)";
                    res.formulasi = "m = 2 × Ek / v²";
                    res.diketahuiText = [`Ek = ${ek} J`, `v = ${v} m/s`];
                    const val = (2 * ek) / (v ** 2);
                    res.langkahPerhitungan = [`m = (2 × ${ek}) / (${v})²`, `m = ${2*ek} / ${v**2}`];
                    res.hasilAkhir = `${val.toFixed(2)} kg`;
                    res.kesimpulan = `Massa benda tersebut adalah ${val.toFixed(2)} kg.`;
                } else if (target === 'v') {
                    res.ditanyakan = "Kecepatan (v)";
                    res.formulasi = "v = √(2 × Ek / m)";
                    res.diketahuiText = [`Ek = ${ek} J`, `m = ${m} kg`];
                    const val = Math.sqrt((2 * ek) / m);
                    res.langkahPerhitungan = [`v = √(2 × ${ek} / ${m})`, `v = √(${2*ek} / ${m}) = √(${((2*ek)/m).toFixed(2)})`];
                    res.hasilAkhir = `${val.toFixed(2)} m/s`;
                    res.kesimpulan = `Kecepatan benda adalah ${val.toFixed(2)} m/s.`;
                }
                break;
            }

            case "ep": {
                const m = getVal('m');
                const g = getVal('g') || 10.0;
                const h = getVal('h');
                const ep = getVal('ep');
                const target = inputs.target;

                if (target === 'ep') {
                    res.ditanyakan = "Energi Potensial (Ep)";
                    res.formulasi = "Ep = m × g × h";
                    res.diketahuiText = [`m = ${m} kg`, `g = ${g} m/s²`, `h = ${h} m`];
                    const val = m * g * h;
                    res.langkahPerhitungan = [`Ep = ${m} × ${g} × ${h}`, `Ep = ${m*g} × ${h}`];
                    res.hasilAkhir = `${val.toFixed(2)} Joule`;
                    res.kesimpulan = `Energi potensial benda adalah ${val.toFixed(2)} Joule.`;
                } else if (target === 'h') {
                    res.ditanyakan = "Ketinggian (h)";
                    res.formulasi = "h = Ep / (m × g)";
                    res.diketahuiText = [`Ep = ${ep} J`, `m = ${m} kg`, `g = ${g} m/s²`];
                    const val = ep / (m * g);
                    res.langkahPerhitungan = [`h = ${ep} / (${m} × ${g})`, `h = ${ep} / ${m*g}`];
                    res.hasilAkhir = `${val.toFixed(2)} meter`;
                    res.kesimpulan = `Ketinggian benda adalah ${val.toFixed(2)} meter.`;
                } else if (target === 'm') {
                    res.ditanyakan = "Massa (m)";
                    res.formulasi = "m = Ep / (g × h)";
                    res.diketahuiText = [`Ep = ${ep} J`, `g = ${g} m/s²`, `h = ${h} m`];
                    const val = ep / (g * h);
                    res.langkahPerhitungan = [`m = ${ep} / (${g} × ${h})`, `m = ${ep} / ${g*h}`];
                    res.hasilAkhir = `${val.toFixed(2)} kg`;
                    res.kesimpulan = `Massa benda adalah ${val.toFixed(2)} kg.`;
                }
                break;
            }

            case "em": {
                const ep = getVal('ep');
                const ek = getVal('ek');
                const em = getVal('em');
                const target = inputs.target;

                if (target === 'em') {
                    res.ditanyakan = "Energi Mekanik (Em)";
                    res.formulasi = "Em = Ep + Ek";
                    res.diketahuiText = [`Ep = ${ep} J`, `Ek = ${ek} J`];
                    const val = ep + ek;
                    res.langkahPerhitungan = [`Em = ${ep} + ${ek}`];
                    res.hasilAkhir = `${val.toFixed(2)} Joule`;
                    res.kesimpulan = `Energi mekanik total adalah ${val.toFixed(2)} Joule.`;
                } else if (target === 'ep') {
                    res.ditanyakan = "Energi Potensial (Ep)";
                    res.formulasi = "Ep = Em - Ek";
                    res.diketahuiText = [`Em = ${em} J`, `Ek = ${ek} J`];
                    const val = em - ek;
                    res.langkahPerhitungan = [`Ep = ${em} - ${ek}`];
                    res.hasilAkhir = `${val.toFixed(2)} Joule`;
                    res.kesimpulan = `Besar energi potensial adalah ${val.toFixed(2)} Joule.`;
                } else if (target === 'ek') {
                    res.ditanyakan = "Energi Kinetik (Ek)";
                    res.formulasi = "Ek = Em - Ep";
                    res.diketahuiText = [`Em = ${em} J`, `Ep = ${ep} J`];
                    const val = em - ep;
                    res.langkahPerhitungan = [`Ek = ${em} - ${ep}`];
                    res.hasilAkhir = `${val.toFixed(2)} Joule`;
                    res.kesimpulan = `Besar energi kinetik adalah ${val.toFixed(2)} Joule.`;
                }
                break;
            }

            case "usaha": {
                const f = getVal('f');
                const s = getVal('s');
                const theta = getVal('theta') !== undefined ? getVal('theta') : 0;
                const w = getVal('w');
                const target = inputs.target;

                const rad = (theta * Math.PI) / 180;
                const cosTheta = Math.cos(rad);

                if (target === 'w') {
                    res.ditanyakan = "Usaha (W)";
                    res.formulasi = "W = F × s × cos(θ)";
                    res.diketahuiText = [`F = ${f} N`, `s = ${s} m`, `θ = ${theta}°`];
                    const val = f * s * cosTheta;
                    res.langkahPerhitungan = [`W = ${f} × ${s} × cos(${theta}°)`];
                    res.hasilAkhir = `${val.toFixed(2)} Joule`;
                    res.kesimpulan = `Usaha yang dilakukan gaya pada perpindahan tersebut adalah ${val.toFixed(2)} Joule.`;
                } else if (target === 'f') {
                    res.ditanyakan = "Gaya (F)";
                    res.formulasi = "F = W / (s × cos(θ))";
                    res.diketahuiText = [`W = ${w} J`, `s = ${s} m`, `θ = ${theta}°`];
                    const val = w / (s * cosTheta);
                    res.langkahPerhitungan = [`F = ${w} / (${s} × ${cosTheta.toFixed(3)})`];
                    res.hasilAkhir = `${val.toFixed(2)} Newton`;
                    res.kesimpulan = `Besar gaya yang bekerja adalah ${val.toFixed(2)} Newton.`;
                } else if (target === 's') {
                    res.ditanyakan = "Perpindahan (s)";
                    res.formulasi = "s = W / (F × cos(θ))";
                    res.diketahuiText = [`W = ${w} J`, `F = ${f} N`, `θ = ${theta}°`];
                    const val = w / (f * cosTheta);
                    res.langkahPerhitungan = [`s = ${w} / (${f} × ${cosTheta.toFixed(3)})`];
                    res.hasilAkhir = `${val.toFixed(2)} meter`;
                    res.kesimpulan = `Jarak perpindahan benda adalah ${val.toFixed(2)} meter.`;
                }
                break;
            }

            case "daya": {
                const w = getVal('w');
                const t = getVal('t');
                const p = getVal('p');
                const target = inputs.target;

                if (target === 'p') {
                    res.ditanyakan = "Daya (P)";
                    res.formulasi = "P = W / t";
                    res.diketahuiText = [`W = ${w} J`, `t = ${t} s`];
                    const val = w / t;
                    res.langkahPerhitungan = [`P = ${w} / ${t}`];
                    res.hasilAkhir = `${val.toFixed(2)} Watt`;
                    res.kesimpulan = `Daya rata-rata mesin/usaha tersebut adalah ${val.toFixed(2)} Watt.`;
                } else if (target === 'w') {
                    res.ditanyakan = "Usaha (W)";
                    res.formulasi = "W = P × t";
                    res.diketahuiText = [`P = ${p} W`, `t = ${t} s`];
                    const val = p * t;
                    res.langkahPerhitungan = [`W = ${p} × ${t}`];
                    res.hasilAkhir = `${val.toFixed(2)} Joule`;
                    res.kesimpulan = `Usaha total yang dihasilkan adalah ${val.toFixed(2)} Joule.`;
                } else if (target === 't') {
                    res.ditanyakan = "Waktu (t)";
                    res.formulasi = "t = W / P";
                    res.diketahuiText = [`W = ${w} J`, `P = ${p} W`];
                    const val = w / p;
                    res.langkahPerhitungan = [`t = ${w} / ${p}`];
                    res.hasilAkhir = `${val.toFixed(2)} sekon`;
                    res.kesimpulan = `Waktu yang diperlukan adalah ${val.toFixed(2)} sekon.`;
                }
                break;
            }

            case "bidangMiring": {
                const L = getVal('l');
                const theta = getVal('theta');
                const mu = getVal('mu') !== undefined ? getVal('mu') : 0;
                const m = getVal('m') || 2.0;
                const g = getVal('g') || 10.0;
                const target = inputs.target;

                const rad = (theta * Math.PI) / 180;

                if (target === 'h') {
                    res.ditanyakan = "Tinggi Vertikal Bidang Miring (h)";
                    res.formulasi = "h = L × sin(θ)";
                    res.diketahuiText = [`Panjang L = ${L} m`, `Sudut θ = ${theta}°`];
                    const val = L * Math.sin(rad);
                    res.langkahPerhitungan = [`h = ${L} × sin(${theta}°)`, `h = ${L} × ${Math.sin(rad).toFixed(3)}`];
                    res.hasilAkhir = `${val.toFixed(2)} meter`;
                    res.kesimpulan = `Ketinggian vertikal ujung bidang miring adalah ${val.toFixed(2)} meter.`;
                } else if (target === 'a') {
                    res.ditanyakan = "Percepatan benda di bidang miring (a)";
                    res.formulasi = "a = g(sin(θ) - μ cos(θ))";
                    res.diketahuiText = [`m = ${m} kg`, `g = ${g} m/s²`, `θ = ${theta}°`, `µ = ${mu}`];
                    const a_val = Math.max(0, g * (Math.sin(rad) - mu * Math.cos(rad)));
                    res.langkahPerhitungan = [`a = ${g} × (sin(${theta}°) - ${mu} × cos(${theta}°))`];
                    res.hasilAkhir = `${a_val.toFixed(2)} m/s²`;
                    res.kesimpulan = `Percepatan gerak benda menuruni bidang miring adalah ${a_val.toFixed(2)} m/s².`;
                }
                break;
            }

            case "bandul": {
                const l = getVal('l');
                const g = getVal('g') || 10.0;
                const target = inputs.target;

                if (target === 'periode') {
                    res.ditanyakan = "Periode Bandul Sederhana (T)";
                    res.formulasi = "T = 2π × √(L / g)";
                    res.diketahuiText = [`Panjang Tali L = ${l} m`, `g = ${g} m/s²`];
                    const val = 2 * Math.PI * Math.sqrt(l / g);
                    res.langkahPerhitungan = [`T = 2 × 3.1416 × √(${l} / ${g})`];
                    res.hasilAkhir = `${val.toFixed(2)} sekon`;
                    res.kesimpulan = `Periode ayunan bandul sederhana adalah ${val.toFixed(2)} sekon (berlaku untuk pendekatan sudut kecil θ ≤ 15°).`;
                }
                break;
            }

            case "angkatBeban": {
                const m = getVal('m');
                const g = getVal('g') || 10.0;
                const h = getVal('h');
                const t = getVal('t');
                const target = inputs.target;

                if (target === 'w') {
                    res.ditanyakan = "Usaha Mengangkat Beban (W)";
                    res.formulasi = "W = m × g × h";
                    res.diketahuiText = [`m = ${m} kg`, `g = ${g} m/s²`, `h = ${h} m`];
                    const val = m * g * h;
                    res.langkahPerhitungan = [`W = ${m} × ${g} × ${h}`];
                    res.hasilAkhir = `${val.toFixed(2)} Joule`;
                    res.kesimpulan = `Usaha untuk mengangkat beban adalah ${val.toFixed(2)} Joule.`;
                } else if (target === 'p') {
                    res.ditanyakan = "Daya Rata-rata (P)";
                    res.formulasi = "P = (m × g × h) / t";
                    res.diketahuiText = [`m = ${m} kg`, `g = ${g} m/s²`, `h = ${h} m`, `t = ${t} s`];
                    const val = (m * g * h) / t;
                    res.langkahPerhitungan = [`W = ${m*g*h} J`, `P = ${m*g*h} / ${t}`];
                    res.hasilAkhir = `${val.toFixed(2)} Watt`;
                    res.kesimpulan = `Daya rata-rata pengangkatan adalah ${val.toFixed(2)} Watt.`;
                }
                break;
            }

            default:
                res.hasilAkhir = "Silakan lengkapi data dengan benar.";
        }

        return res;
    }
}