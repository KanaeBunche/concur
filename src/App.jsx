import { useEffect, useMemo, useRef, useState } from "react";

/**
 * CONCOURS — Detailing site styled as a service ticket / work order.
 * Real site anatomy (hero + sections + services) in the ticket layout language.
 */

const OPS = [
  { code: "EXT-01", name: "Exterior Hand Detail", hrs: "2.0", price: 120 },
  { code: "INT-02", name: "Interior Deep Clean", hrs: "2.5", price: 140 },
  { code: "COR-03", name: "Paint Correction — 1 stage", hrs: "4.0", price: 350 },
  { code: "CER-04", name: "Ceramic Coating", hrs: "6.0", price: 700 },
  { code: "HLR-05", name: "Headlight Restoration", hrs: "1.0", price: 90 },
  { code: "ENG-06", name: "Engine Bay Detail", hrs: "1.0", price: 80 },
];

const PROCEDURE = [
  ["01", "Inspect", "Paint depth and defects logged under inspection lighting."],
  ["02", "Decontaminate", "Foam, hand wash, iron removal, and clay."],
  ["03", "Correct", "Machine polishing removes swirls and oxidation."],
  ["04", "Protect", "Sealant or ceramic coating is applied and cured."],
  ["05", "Reveal", "Final wipe-down, inspection, keys returned."],
];

const PACKAGES = [
  { name: "Express", codes: ["EXT-01"], note: "Maintenance wash & protect" },
  { name: "Full Detail", codes: ["EXT-01", "INT-02", "COR-03"], note: "Inside, out, and corrected", star: true },
  { name: "Showroom", codes: ["EXT-01", "INT-02", "COR-03", "CER-04"], note: "Concours-level + coating" },
];

const SIGNOFFS = [
  { q: "Deeper than the day I bought it. Zero swirls.", n: "Marcus T.", c: "BMW M4" },
  { q: "Water just sheets off now. Worth every dollar.", n: "Dana R.", c: "Tesla Model 3" },
  { q: "Stains I had given up on — gone. Brand new.", n: "Priya S.", c: "Audi Q5" },
];

const PHOTO_A = "/images/1.png";
const PHOTO_B = "/images/2.png";

const money = (n) => "$" + n.toFixed(2);
const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

function SecBar({ n, t }) {
  return <div className="wo-secbar"><span className="wo-secn">{n}</span><span>{t}</span></div>;
}

function Typed({ text, speed = 130, delay = 400 }) {
  const [n, setN] = useState(0);
  const [armed, setArmed] = useState(false);
  useEffect(() => { const t = setTimeout(() => setArmed(true), delay); return () => clearTimeout(t); }, [delay]);
  useEffect(() => {
    if (!armed || n >= text.length) return;
    const t = setTimeout(() => setN((x) => x + 1), speed);
    return () => clearTimeout(t);
  }, [armed, n, text, speed]);
  return (
    <>
      {text.slice(0, n)}
      <span className="wo-caret" aria-hidden="true" />
    </>
  );
}

export default function WorkOrderSite() {
  const [sel, setSel] = useState(new Set(["EXT-01", "INT-02"]));
  const [booked, setBooked] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", sign: "", date: "", time: "", loc: "In-studio" });
  const dotRef = useRef(null);
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  const toggle = (code) => setSel((s) => { const n = new Set(s); n.has(code) ? n.delete(code) : n.add(code); return n; });
  const pickPackage = (codes) => { setSel(new Set(codes)); go("ops"); };

  const { subtotal, supplies, tax, total } = useMemo(() => {
    const subtotal = OPS.filter((o) => sel.has(o.code)).reduce((a, o) => a + o.price, 0);
    const supplies = subtotal ? Math.round(subtotal * 0.04) : 0;
    const tax = (subtotal + supplies) * 0.08875;
    return { subtotal, supplies, tax, total: subtotal + supplies + tax };
  }, [sel]);

  const today = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  const authorize = () => (!f.name || !f.phone) ? alert("Add name and phone to authorize.") : setBooked(true);

  useEffect(() => {
    const dot = dotRef.current; if (!dot) return;
    let mx = innerWidth / 2, my = innerHeight / 2, x = mx, y = my, raf;
    const move = (e) => { mx = e.clientX; my = e.clientY; };
    const loop = () => { x += (mx - x) * 0.2; y += (my - y) * 0.2; dot.style.transform = "translate(" + x + "px," + y + "px) translate(-50%,-50%)"; raf = requestAnimationFrame(loop); };
    addEventListener("mousemove", move); loop();
    return () => { removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);
  const pkgTotal = (codes) => OPS.filter((o) => codes.includes(o.code)).reduce((a, o) => a + o.price, 0);

  return (
    <div className="wo">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Caveat:wght@500;700&display=swap');
        .wo { --paper:#F6F2E9; --ink:#1A160F; --line:rgba(26,22,15,.22); --soft:rgba(26,22,15,.55); --red:#C24631; --blue:#22408C;
          background:var(--paper); color:var(--ink); font-family:'Space Mono',monospace;
          background-image:linear-gradient(rgba(26,22,15,.02) 1px, transparent 1px); background-size:100% 32px; }
        .wo * { box-sizing:border-box; }
        .wo { cursor:none; }
        .wo-dot { position:fixed; top:0; left:0; width:26px; height:26px; border:1.5px solid #fff; border-radius:50%; pointer-events:none; z-index:9999; mix-blend-mode:difference; will-change:transform; }
        @media (pointer:coarse) { .wo { cursor:auto; } .wo-dot { display:none; } }
        .hw { font-family:'Caveat',cursive; color:var(--blue); font-weight:600; }
        .wrap { max-width:1080px; margin:0 auto; padding:0 28px; }

        /* NAV / letterhead */
        .wo-nav { position:sticky; top:0; z-index:40; background:var(--paper); border-bottom:2px solid var(--ink); }
        .wo-nav-in { max-width:1080px; margin:0 auto; padding:14px 28px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .wo-brand { font-size:18px; font-weight:700; letter-spacing:.1em; }
        .wo-brand span { color:var(--red); font-size:10px; vertical-align:super; }
        .wo-links { display:flex; gap:26px; }
        .wo-links button { background:0; border:0; font-family:inherit; font-size:12px; letter-spacing:.06em; color:var(--soft); cursor:pointer; text-transform:uppercase; }
        .wo-links button:hover { color:var(--ink); }
        .wo-navbtn { background:var(--ink); color:var(--paper); border:0; font-family:inherit; padding:10px 18px; font-size:12px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; cursor:pointer; }
        .wo-burger { display:none; }

        /* HERO */
        .wo-hero { position:relative; padding:48px 0 60px; border-bottom:2px dashed var(--line); overflow:hidden; }
        .wo-hero-strip { display:flex; flex-wrap:wrap; gap:26px; font-size:12px; padding-bottom:30px; }
        .wo-hero-strip b { font-weight:700; }
        .wo-h1 { font-size:clamp(3rem,12vw,8.5rem); font-weight:700; line-height:.84; letter-spacing:-.03em; margin:0; }
        .wo-h1 em { font-style:normal; color:var(--red); }
        .wo-caret { display:inline-block; width:2px; height:.92em; background:var(--ink); margin-left:.1em; vertical-align:-.02em; animation:woBlink 1s steps(1,end) infinite; }
        @keyframes woBlink { 50% { opacity:0; } }
        .wo-lead { max-width:52ch; font-size:14px; line-height:1.7; color:var(--soft); margin:26px 0 0; }
        .wo-cta-row { display:flex; gap:16px; align-items:center; margin-top:34px; flex-wrap:wrap; }
        .wo-cta { background:var(--red); color:var(--paper); border:0; font-family:inherit; padding:16px 30px; font-size:13px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; cursor:pointer; transition:background .2s; }
        .wo-cta:hover { background:var(--ink); }
        .wo-cta2 { background:0; border:0; font-family:inherit; font-size:13px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; border-bottom:2px solid var(--ink); padding-bottom:4px; cursor:pointer; }
        .wo-note { margin-top:22px; font-size:22px; }
        .wo-stamp { position:absolute; top:40px; right:18px; border:3px solid var(--red); color:var(--red); font-weight:700; font-size:17px; letter-spacing:.12em; padding:6px 14px; transform:rotate(-9deg); opacity:.85; border-radius:3px; }
        .wo-watermark { position:absolute; right:-2%; bottom:-6%; font-size:24vw; font-weight:700; color:rgba(26,22,15,.035); letter-spacing:-.04em; pointer-events:none; line-height:.8; }

        /* sections */
        .wo-sec { padding:54px 0; border-bottom:2px dashed var(--line); position:relative; }
        .wo-secbar { display:flex; align-items:center; gap:12px; background:var(--ink); color:var(--paper); padding:9px 14px; font-size:12px; letter-spacing:.1em; text-transform:uppercase; margin-bottom:0; }
        .wo-secn { font-weight:700; color:var(--red); }

        /* operations */
        .wo-ops-grid { display:grid; grid-template-columns:1fr 320px; gap:0; align-items:start; }
        .wo-presets { display:flex; align-items:center; flex-wrap:wrap; gap:10px; border:1px solid var(--line); border-top:0; padding:12px 14px; }
        .wo-presets-lbl { font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--soft); margin-right:4px; }
        .wo-preset { background:var(--paper); border:1px solid var(--ink); font-family:inherit; font-size:12px; font-weight:700; padding:8px 14px; cursor:pointer; transition:all .15s; }
        .wo-preset:hover { background:rgba(26,22,15,.06); }
        .wo-preset.on { background:var(--ink); color:var(--paper); }
        .wo-preset.clear { border-style:dashed; font-weight:400; color:var(--soft); }
        .wo-attach-lbl { font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--soft); margin-bottom:26px; }
        .wo-photos { display:flex; gap:42px; flex-wrap:wrap; justify-content:center; padding:8px 0 14px; }
        .wo-photo { background:#fff; padding:10px 10px 0; box-shadow:0 12px 30px rgba(0,0,0,.2); position:relative; width:320px; max-width:100%; }
        .wo-photo img { width:100%; height:auto; display:block; }
        .wo-photo .cap { font-family:'Caveat',cursive; color:var(--blue); font-size:24px; font-weight:600; text-align:center; padding:8px 0 14px; }
        .wo-photo.tilt-l { transform:rotate(-2.5deg); } .wo-photo.tilt-r { transform:rotate(2deg); }
        .wo-tape { position:absolute; top:-13px; left:calc(50% - 32px); width:64px; height:26px; background:rgba(194,70,49,.22); border:1px solid rgba(194,70,49,.32); transform:rotate(-4deg); }
        .wo-items { border:1px solid var(--line); border-top:0; }
        .wo-irow { display:grid; grid-template-columns:42px 92px 1fr 54px 84px; align-items:center; gap:10px; padding:13px 14px; border-bottom:1px solid var(--line); cursor:pointer; transition:background .15s; }
        .wo-irow:last-child { border-bottom:0; }
        .wo-irow.head { background:rgba(26,22,15,.05); cursor:default; font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--soft); }
        .wo-irow:not(.head):hover { background:rgba(26,22,15,.04); }
        .wo-irow.on { background:rgba(194,70,49,.07); }
        .wo-box { width:20px; height:20px; border:1.5px solid var(--ink); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:var(--red); }
        .wo-irow.on .wo-box:after { content:"✕"; }
        .wo-code { font-size:12px; color:var(--soft); }
        .wo-name { font-size:13px; font-weight:700; }
        .wo-hrs { font-size:12px; color:var(--soft); text-align:right; }
        .wo-amt { font-size:13px; font-weight:700; text-align:right; }

        .wo-est { border:1px solid var(--line); border-top:0; border-left:0; background:rgba(26,22,15,.03); padding:18px 18px 22px; position:sticky; top:80px; }
        .wo-est h4 { margin:0 0 12px; font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--soft); }
        .wo-trow { display:flex; justify-content:space-between; font-size:13px; padding:8px 0; border-bottom:1px dotted var(--line); }
        .wo-trow.big { border-bottom:0; padding-top:14px; }
        .wo-trow.big b { font-size:24px; }
        .wo-est .wo-cta { width:100%; margin-top:16px; text-align:center; }

        /* procedure */
        .wo-proc { display:grid; grid-template-columns:repeat(5,1fr); border:1px solid var(--line); border-top:0; }
        .wo-step { padding:20px 16px; border-right:1px solid var(--line); }
        .wo-step:last-child { border-right:0; }
        .wo-step-n { font-size:12px; color:var(--red); font-weight:700; }
        .wo-step h4 { margin:10px 0 8px; font-size:15px; }
        .wo-step p { margin:0; font-size:11px; line-height:1.6; color:var(--soft); }

        /* packages */
        .wo-pks { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; padding-top:22px; }
        .wo-pk { border:1px solid var(--ink); padding:22px; display:flex; flex-direction:column; background:var(--paper); }
        .wo-pk.star { background:var(--ink); color:var(--paper); }
        .wo-pk-top { display:flex; justify-content:space-between; align-items:baseline; }
        .wo-pk h4 { margin:0; font-size:18px; }
        .wo-pk .price { font-size:26px; font-weight:700; }
        .wo-pk .note { font-size:11px; color:var(--soft); margin:6px 0 16px; }
        .wo-pk.star .note { color:rgba(246,242,233,.6); }
        .wo-pk ul { list-style:none; margin:0 0 18px; padding:0; flex:1; }
        .wo-pk li { font-size:12px; padding:7px 0; border-top:1px dotted var(--line); }
        .wo-pk.star li { border-color:rgba(246,242,233,.18); }
        .wo-pk li:before { content:"+ "; color:var(--red); }
        .wo-pk button { background:var(--red); color:var(--paper); border:0; font-family:inherit; padding:13px; font-size:12px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; cursor:pointer; }
        .wo-pk.star button { background:var(--paper); color:var(--ink); }

        /* sign-offs */
        .wo-slips { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; padding-top:22px; }
        .wo-slip { border:1px solid var(--line); padding:20px; position:relative; }
        .wo-slip p { font-size:13px; line-height:1.6; margin:0 0 20px; }
        .wo-slip .by { font-size:11px; color:var(--soft); }
        .wo-slip .sig { font-family:'Caveat',cursive; color:var(--blue); font-size:26px; font-weight:600; margin-top:2px; }
        .wo-slip .ok { position:absolute; top:14px; right:14px; border:2px solid var(--red); color:var(--red); font-size:9px; font-weight:700; letter-spacing:.1em; padding:3px 7px; transform:rotate(-8deg); border-radius:2px; }

        /* authorization */
        .wo-auth { border:1px solid var(--line); border-top:0; padding:24px; position:relative; }
        .wo-arow { display:flex; gap:20px; flex-wrap:wrap; }
        .wo-in { flex:1; min-width:200px; display:flex; flex-direction:column; gap:6px; }
        .wo-in label { font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--soft); }
        .wo-in input { border:0; border-bottom:1.5px solid var(--ink); background:transparent; padding:8px 2px; outline:none; font-family:'Caveat',cursive; color:var(--blue); font-size:25px; font-weight:600; }
        .wo-in.sign input { font-size:30px; }
        .wo-in.plain input { font-family:'Space Mono',monospace; color:var(--ink); font-size:14px; }
        .wo-toggle { display:flex; gap:8px; margin-top:4px; flex-wrap:wrap; }
        .wo-toggle button { background:var(--paper); border:1px solid var(--ink); font-family:inherit; font-size:12px; font-weight:700; padding:9px 14px; cursor:pointer; transition:all .15s; }
        .wo-toggle button.on { background:var(--ink); color:var(--paper); }
        .wo-authbtn { margin-top:24px; background:var(--ink); color:var(--paper); border:0; font-family:inherit; padding:16px 30px; font-size:13px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; transition:background .2s; }
        .wo-authbtn:hover { background:var(--red); }
        .wo-bookstamp { position:absolute; top:30px; right:34px; border:4px solid var(--red); color:var(--red); font-weight:700; font-size:24px; letter-spacing:.14em; padding:9px 18px; transform:rotate(-11deg); border-radius:4px; animation:slap .35s cubic-bezier(.3,1.4,.5,1) both; }
        .wo-done { font-size:13px; color:var(--soft); margin-top:14px; line-height:1.7; }
        @keyframes slap { from { transform:rotate(-11deg) scale(2.2); opacity:0; } to { transform:rotate(-11deg) scale(1); opacity:1; } }

        /* footer */
        .wo-foot { padding:40px 0 50px; }
        .wo-terms { font-size:10px; color:var(--soft); line-height:1.7; max-width:80ch; }
        .wo-barwrap { display:flex; flex-direction:column; align-items:center; gap:6px; margin:26px 0 0; }
        .wo-barcode { width:240px; height:50px; background:repeating-linear-gradient(90deg, var(--ink) 0 2px, transparent 2px 4px, var(--ink) 4px 7px, transparent 7px 9px, var(--ink) 9px 10px, transparent 10px 14px); }
        .wo-barnum { font-size:12px; letter-spacing:.4em; }
        .wo-credit { text-align:center; font-size:10px; color:var(--soft); letter-spacing:.1em; margin-top:14px; }

        @media (max-width:820px) {
          .wo-links, .wo-navbtn { display:none; }
          .wo-ops-grid { grid-template-columns:1fr; }
          .wo-est { border-left:1px solid var(--line); position:static; }
          .wo-proc { grid-template-columns:1fr 1fr; }
          .wo-pks, .wo-slips { grid-template-columns:1fr; }
        }
        @media (max-width:560px) {
          .wo-irow { grid-template-columns:34px 1fr 78px; }
          .wo-code, .wo-hrs { display:none; }
          .wo-proc { grid-template-columns:1fr; }
          .wo-stamp { font-size:13px; right:8px; }
        }
      `}</style>

      <div ref={dotRef} className="wo-dot" aria-hidden="true" />

      {/* NAV */}
      <nav className="wo-nav">
        <div className="wo-nav-in">
          <div className="wo-brand" onClick={() => go("hero")} style={{ cursor: "pointer" }}>CONCOURS<span>®</span></div>
          <div className="wo-links">
            <button onClick={() => go("ops")}>Operations</button>
            <button onClick={() => go("proc")}>Procedure</button>
            <button onClick={() => go("book")}>Authorize</button>
          </div>
          <button className="wo-navbtn" onClick={() => go("book")}>Book ▸</button>
        </div>
      </nav>

      {/* HERO */}
      <header id="hero" className="wo-hero">
        <div className="wrap">
          <div className="wo-hero-strip">
            <span>R.O. No. <b>04-2291</b></span>
            <span>Date <span className="hw" style={{ fontSize: "1.4em" }}>{today}</span></span>
            <span>Bay <b>04</b></span>
            <span>Status <b>OPEN</b></span>
          </div>
          <h1 className="wo-h1">EVERY DETAIL,<br /><em><Typed text="ITEMIZED." /></em></h1>
          <p className="wo-lead">
            Premium auto detailing written like a work order. Pick the operations you want,
            watch the estimate total live, and authorize it yourself. Done by hand. No upsells,
            no mystery line items.
          </p>
          <div className="wo-cta-row">
            <button className="wo-cta" onClick={() => go("ops")}>Build your order ▸</button>
            <button className="wo-cta2" onClick={() => go("proc")}>How it works</button>
          </div>
          <div className="wo-note hw">— done by hand, signed off by you</div>
          <div className="wo-stamp">ESTIMATE</div>
          <div className="wo-watermark">RO</div>
        </div>
      </header>

      {/* OPERATIONS */}
      <section id="ops" className="wo-sec">
        <div className="wrap">
          <SecBar n="01" t="Build your order — package or à la carte" />
          <div className="wo-presets">
            <span className="wo-presets-lbl">Quick start</span>
            {PACKAGES.map((p) => {
              const on = sel.size === p.codes.length && p.codes.every((c) => sel.has(c));
              return <button key={p.name} className={"wo-preset" + (on ? " on" : "")} onClick={() => setSel(new Set(p.codes))}>{p.name} · {money(pkgTotal(p.codes))}</button>;
            })}
            <button className="wo-preset clear" onClick={() => setSel(new Set())}>Clear</button>
          </div>
          <div className="wo-ops-grid">
            <div className="wo-items">
              <div className="wo-irow head"><span /><span>Code</span><span>Description</span><span>Hrs</span><span style={{ textAlign: "right" }}>Amount</span></div>
              {OPS.map((o) => {
                const on = sel.has(o.code);
                return (
                  <div className={"wo-irow" + (on ? " on" : "")} key={o.code} onClick={() => toggle(o.code)}>
                    <span className="wo-box" /><span className="wo-code">{o.code}</span>
                    <span className="wo-name">{o.name}</span><span className="wo-hrs">{o.hrs}</span>
                    <span className="wo-amt">{money(o.price)}</span>
                  </div>
                );
              })}
            </div>
            <div className="wo-est">
              <h4>Live Estimate</h4>
              <div className="wo-trow"><span>Subtotal · {sel.size} ops</span><span>{money(subtotal)}</span></div>
              <div className="wo-trow"><span>Shop supplies</span><span>{money(supplies)}</span></div>
              <div className="wo-trow"><span>Tax 8.875%</span><span>{money(tax)}</span></div>
              <div className="wo-trow big"><span>Total</span><b>{money(total)}</b></div>
              <button className="wo-cta" onClick={() => go("book")}>Authorize ▸</button>
            </div>
          </div>
        </div>
      </section>

      {/* PHOTOS */}
      <section className="wo-sec">
        <div className="wrap">
          <div className="wo-attach-lbl">▸ Previous Work Done.</div>
          <div className="wo-photos">
            <figure className="wo-photo tilt-l"><span className="wo-tape" /><img src={PHOTO_A} alt="Before and after detail" /><figcaption className="cap">before → after</figcaption></figure>
            <figure className="wo-photo tilt-r"><span className="wo-tape" /><img src={PHOTO_B} alt="Before and after detail" /><figcaption className="cap">before → after</figcaption></figure>
          </div>
        </div>
      </section>

      {/* PROCEDURE */}
      <section id="proc" className="wo-sec">
        <div className="wrap">
          <SecBar n="02" t="Procedure — every order, every time" />
          <div className="wo-proc">
            {PROCEDURE.map(([n, t, d]) => (
              <div className="wo-step" key={n}>
                <div className="wo-step-n">{n}</div><h4>{t}</h4><p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGN-OFFS */}
      <section className="wo-sec">
        <div className="wrap">
          <SecBar n="03" t="Sign-offs — owner approvals" />
          <div className="wo-slips">
            {SIGNOFFS.map((s) => (
              <div className="wo-slip" key={s.n}>
                <div className="ok">APPROVED</div>
                <p>"{s.q}"</p>
                <div className="by">{s.c}</div>
                <div className="sig">{s.n}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUTHORIZATION */}
      <section id="book" className="wo-sec">
        <div className="wrap">
          <SecBar n="04" t="Authorization" />
          <div className="wo-auth">
            {booked && <div className="wo-bookstamp">BOOKED ✓</div>}
            <div className="wo-arow">
              <div className="wo-in"><label>Printed name</label><input value={f.name} onChange={set("name")} /></div>
              <div className="wo-in"><label>Phone</label><input value={f.phone} onChange={set("phone")} /></div>
            </div>
            <div className="wo-arow" style={{ marginTop: 16 }}>
              <div className="wo-in plain"><label>Drop-off date</label><input type="date" value={f.date} onChange={set("date")} /></div>
              <div className="wo-in plain"><label>Drop-off time</label><input type="time" value={f.time} onChange={set("time")} /></div>
            </div>
            <div className="wo-arow" style={{ marginTop: 16 }}>
              <div className="wo-in plain"><label>Location</label>
                <div className="wo-toggle">
                  <button type="button" className={f.loc === "In-studio" ? "on" : ""} onClick={() => setF((v) => ({ ...v, loc: "In-studio" }))}>In-studio</button>
                  <button type="button" className={f.loc === "Mobile" ? "on" : ""} onClick={() => setF((v) => ({ ...v, loc: "Mobile" }))}>Mobile — we come to you</button>
                </div>
              </div>
            </div>
            <div className="wo-arow" style={{ marginTop: 16 }}>
              <div className="wo-in sign"><label>Signature — authorizes the {sel.size} operations above ({money(total)})</label><input value={f.sign} onChange={set("sign")} /></div>
            </div>
            {!booked
              ? <button className="wo-authbtn" onClick={authorize}>Authorize &amp; Book ▸</button>
              : <p className="wo-done">Order <b>#04-2291</b> authorized for {money(total)}. Drop-off {f.date || "TBD"}{f.time ? " at " + f.time : ""} · {f.loc}. We will call {f.phone} to confirm. Keep this ticket.</p>}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="wo-foot">
        <div className="wrap">
          <p className="wo-terms">
            Estimate valid 14 days from date of issue. Final total may vary with vehicle condition on intake. All work performed by certified,
            fully insured technicians. Ceramic coatings carry manufacturer warranty. Prices in USD. This document constitutes a request for
            service, not a binding contract, until authorized in section 05.
          </p>
          <div className="wo-barwrap"><div className="wo-barcode" /><span className="wo-barnum">WE SWEAT THE SMALL STUFF</span></div>
          <div className="wo-credit">CONCOURS DETAIL STUDIO · 1200 CHROME AVE · (555) 014-2280 · BUILT BY KODED BY KANAE</div>
        </div>
      </footer>
    </div>
  );
}