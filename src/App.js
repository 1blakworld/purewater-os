import { useState, useMemo } from "react";

// ── Config ───────────────────────────────────────────────────────────────────
const BAG_PRICE = 140;
const DAILY_TARGET = 800;

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_STOCK = [
  { id:1,  date:"2026-04-25", produce:722, in_stock:620, stock_out:760, total_stock:1259, returns:94,  lickage:4, total_sold:666,  operator:"Bello" },
  { id:2,  date:"2026-04-24", produce:524, in_stock:727, stock_out:510, total_stock:1482, returns:7,   lickage:1, total_sold:502,  operator:"Yinka" },
  { id:3,  date:"2026-04-23", produce:515, in_stock:755, stock_out:300, total_stock:1210, returns:106, lickage:5, total_sold:169,  operator:"Bello" },
  { id:4,  date:"2026-04-22", produce:642, in_stock:455, stock_out:660, total_stock:900,  returns:31,  lickage:3, total_sold:625,  operator:"Yinka" },
  { id:5,  date:"2026-04-21", produce:676, in_stock:453, stock_out:570, total_stock:776,  returns:47,  lickage:2, total_sold:521,  operator:"Bello" },
  { id:6,  date:"2026-04-20", produce:988, in_stock:323, stock_out:875, total_stock:728,  returns:41,  lickage:6, total_sold:823,  operator:"Yinka" },
  { id:7,  date:"2026-04-19", produce:580, in_stock:162, stock_out:1026,total_stock:1194, returns:0,   lickage:6, total_sold:1003, operator:"Bello" },
  { id:8,  date:"2026-04-18", produce:789, in_stock:605, stock_out:710, total_stock:1161, returns:0,   lickage:5, total_sold:705,  operator:"Yinka" },
  { id:9,  date:"2026-04-17", produce:580, in_stock:162, stock_out:1026,total_stock:1194, returns:0,   lickage:3, total_sold:897,  operator:"Bello" },
  { id:10, date:"2026-04-16", produce:641, in_stock:498, stock_out:820, total_stock:1102, returns:22,  lickage:2, total_sold:710,  operator:"Yinka" },
];

const MOCK_EXPENSES = [
  { id:1, date:"2026-04-25", category:"Fuel",        amount:18000, note:"3 trucks",         staff:"Manager" },
  { id:2, date:"2026-04-24", category:"Repairs",     amount:8500,  note:"Sealing machine",  staff:"Manager" },
  { id:3, date:"2026-04-23", category:"Fuel",        amount:12000, note:"Daily ops",         staff:"Manager" },
  { id:4, date:"2026-04-22", category:"Packaging",   amount:22000, note:"Bags restock",      staff:"Manager" },
  { id:5, date:"2026-04-21", category:"Maintenance", amount:5000,  note:"Generator service", staff:"Manager" },
  { id:6, date:"2026-04-20", category:"Salary",      amount:45000, note:"Weekly staff",      staff:"Manager" },
];

const MOCK_DRIVERS = [
  { id:1, date:"2026-04-25", driver_name:"Emeka", operator:"Bello", bags_loaded:250, bags_returned:10, lickage:1, cash_collected:32200, debt_amount:4200, debt_payment_date:"2026-04-28", debt_settled:false },
  { id:2, date:"2026-04-25", driver_name:"Tunde", operator:"Bello", bags_loaded:280, bags_returned:0,  lickage:2, cash_collected:38640, debt_amount:0,    debt_payment_date:"",           debt_settled:false },
  { id:3, date:"2026-04-25", driver_name:"Chidi", operator:"Bello", bags_loaded:220, bags_returned:84, lickage:1, cash_collected:18760, debt_amount:2800, debt_payment_date:"2026-04-29", debt_settled:false },
  { id:4, date:"2026-04-24", driver_name:"Emeka", operator:"Yinka", bags_loaded:180, bags_returned:12, lickage:0, cash_collected:22400, debt_amount:2800, debt_payment_date:"2026-04-26", debt_settled:true  },
  { id:5, date:"2026-04-24", driver_name:"Tunde", operator:"Yinka", bags_loaded:200, bags_returned:0,  lickage:1, cash_collected:27860, debt_amount:0,    debt_payment_date:"",           debt_settled:false },
  { id:6, date:"2026-04-24", driver_name:"Chidi", operator:"Yinka", bags_loaded:130, bags_returned:0,  lickage:0, cash_collected:14000, debt_amount:4200, debt_payment_date:"2026-04-28", debt_settled:false },
  { id:7, date:"2026-04-23", driver_name:"Emeka", operator:"Bello", bags_loaded:150, bags_returned:20, lickage:2, cash_collected:15120, debt_amount:2800, debt_payment_date:"2026-04-25", debt_settled:true  },
  { id:8, date:"2026-04-23", driver_name:"Tunde", operator:"Bello", bags_loaded:150, bags_returned:86, lickage:3, cash_collected:8540,  debt_amount:0,    debt_payment_date:"",           debt_settled:false },
];

const OPERATORS = ["Bello", "Yinka"];
const DRIVERS   = ["Emeka", "Tunde", "Chidi"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt      = n => Number(n||0).toLocaleString("en-NG");
const naira    = n => `₦${Number(n||0).toLocaleString("en-NG")}`;
const todayStr = () => new Date().toISOString().slice(0,10);

const exportCSV = (rows, filename) => {
  if(!rows.length) return;
  const h = Object.keys(rows[0]).join(",");
  const b = rows.map(r=>Object.values(r).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([h+"\n"+b],{type:"text/csv"}));
  a.download = filename; a.click();
};

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#080808;--surf:#111111;--surf2:#1c1c1c;--bdr:#2e2e2e;
  --am:#ffffff;--am2:#444444;--gn:#10b981;--rd:#ef4444;--bl:#aaaaaa;
  --tx:#f0f0f0;--dm:#555555;--md:#888888;
  --mono:'DM Mono',monospace;--sans:'Syne',sans-serif;
  --nh:58px;
}
body{background:var(--bg);color:var(--tx);font-family:var(--sans);min-height:100vh;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:var(--bg);}
::-webkit-scrollbar-thumb{background:var(--bdr);border-radius:3px;}

/* shell */
.shell{display:flex;flex-direction:column;min-height:100vh;}

/* topbar */
.topbar{
  display:flex;align-items:center;justify-content:space-between;
  padding:0 14px;height:50px;background:var(--surf);
  border-bottom:1px solid var(--bdr);position:sticky;top:0;z-index:200;flex-shrink:0;
  gap:8px;
}
.brand{display:flex;align-items:center;gap:9px;}
.logo{width:28px;height:28px;background:var(--tx);border-radius:5px;
  display:flex;align-items:center;justify-content:center;
  font-family:var(--mono);font-weight:700;font-size:11px;color:#000;flex-shrink:0;}
.bname{font-family:var(--sans);font-size:13px;font-weight:700;line-height:1.2;letter-spacing:-.01em;}
.bsub{font-size:10px;color:var(--dm);letter-spacing:.07em;text-transform:uppercase;}
.rpill{font-family:var(--mono);font-size:11px;padding:3px 9px;border-radius:4px;font-weight:500;}
.ra{background:rgba(255,255,255,.08);color:var(--tx);border:1px solid var(--am2);}
.rs{background:rgba(255,255,255,.05);color:var(--md);border:1px solid var(--bdr);}
.bswitch{background:transparent;color:var(--md);border:1px solid var(--bdr);
  padding:4px 9px;border-radius:4px;font-family:var(--mono);font-size:11px;cursor:pointer;transition:all .15s;}
.bswitch:hover{border-color:var(--tx);color:var(--tx);}

/* body */
.body{display:flex;flex:1;overflow:hidden;}

/* sidebar – desktop */
.sidebar{
  width:185px;background:var(--surf);border-right:1px solid var(--bdr);
  padding:14px 0;flex-shrink:0;overflow-y:auto;
  position:sticky;top:50px;height:calc(100vh - 50px);
}
.sid-sec{padding:0 13px 5px;font-size:10px;color:var(--dm);
  letter-spacing:.1em;text-transform:uppercase;font-family:var(--mono);margin-top:12px;}
.ni{
  display:flex;align-items:center;gap:8px;padding:9px 17px;
  font-size:13px;font-weight:600;color:var(--md);cursor:pointer;
  font-family:var(--sans);
  transition:all .15s;border-left:2px solid transparent;
}
.ni:hover{color:var(--tx);background:var(--surf2);}
.ni.on{color:var(--tx);border-left-color:var(--tx);background:rgba(255,255,255,.05);}
.ni-ic{font-size:14px;width:16px;text-align:center;}

/* bottom nav – mobile */
.bnav{
  display:none;position:fixed;bottom:0;left:0;right:0;z-index:200;
  background:var(--surf);border-top:1px solid var(--bdr);height:var(--nh);
}
.bnav-inner{display:flex;height:100%;overflow-x:auto;}
.bnav-inner::-webkit-scrollbar{height:0;}
.bni{
  flex:1;min-width:52px;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:2px;cursor:pointer;color:var(--dm);transition:color .15s;
  font-family:var(--mono);font-size:9px;padding:0 4px;white-space:nowrap;
}
.bni.on{color:var(--tx);}
.bni-ic{font-size:16px;}

/* content */
.content{flex:1;overflow-y:auto;padding:20px 18px;}
@media(max-width:680px){
  .sidebar{display:none;}
  .bnav{display:flex;}
  .content{padding:14px 12px calc(var(--nh) + 16px);}
  /* topbar compact */
  .bname{font-size:11px;}
  .bsub{display:none;}
  .rpill{font-size:10px;padding:2px 7px;}
  /* stat grid — 2 col on phone */
  .sg{grid-template-columns:1fr 1fr;gap:8px;}
  /* today driver cards — 1 col on very small */
  .tg{grid-template-columns:1fr;}
  /* driver summary cards — 2 col */
  .dg{grid-template-columns:1fr 1fr;}
  /* page header stacks */
  .ph{flex-direction:column;align-items:flex-start;}
  /* filter bar scrolls horizontally */
  .fb{flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px;}
  .fb::-webkit-scrollbar{height:0;}
  /* form grid single column */
  .fg-grid{grid-template-columns:1fr;}
  .fg.full{grid-column:1;}
  /* calc strip wraps tighter */
  .cs{gap:10px;font-size:11px;}
  /* stat value smaller */
  .sv{font-size:17px;}
  /* table head actions stack */
  .th{flex-direction:column;align-items:flex-start;gap:6px;}
}
@media(max-width:360px){
  .sg{grid-template-columns:1fr;}
  .dg{grid-template-columns:1fr;}
  .content{padding:10px 10px calc(var(--nh) + 12px);}
}

/* stat grid */
.sg{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:11px;margin-bottom:20px;}
@media(max-width:420px){.sg{grid-template-columns:1fr 1fr;gap:8px;}}
.sc{background:var(--surf);border:1px solid var(--bdr);border-radius:7px;padding:13px 14px;}
.sl{font-size:10px;color:var(--dm);letter-spacing:.09em;text-transform:uppercase;font-family:var(--mono);}
.sv{font-family:var(--sans);font-size:22px;font-weight:700;margin-top:4px;letter-spacing:-.02em;}
.sv.am{color:var(--am);} .sv.gn{color:var(--gn);} .sv.rd{color:var(--rd);}
.sd{font-size:11px;color:var(--dm);margin-top:3px;}
.pw{margin-top:5px;height:3px;background:var(--bdr);border-radius:2px;overflow:hidden;}
.pb{height:100%;border-radius:2px;transition:width .4s;}

/* page header */
.ph{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:18px;flex-wrap:wrap;}
.pt{font-family:var(--sans);font-size:20px;font-weight:800;letter-spacing:-.02em;}
.ps{font-size:12px;color:var(--dm);margin-top:3px;}

/* filter bar */
.fb{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;}
.fbtn{padding:5px 12px;border-radius:4px;font-family:var(--mono);font-size:11px;
  cursor:pointer;border:1px solid var(--bdr);color:var(--md);background:transparent;transition:all .15s;}
.fbtn.on{background:var(--tx);color:#000;border-color:var(--tx);}
.fbtn:hover:not(.on){border-color:var(--tx);color:var(--tx);}

/* table */
.tw{background:var(--surf);border:1px solid var(--bdr);border-radius:7px;overflow:hidden;margin-bottom:18px;}
.th{padding:11px 14px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;}
.tt{font-family:var(--sans);font-size:13px;font-weight:700;}
.ts{overflow-x:auto;-webkit-overflow-scrolling:touch;}
.ts::-webkit-scrollbar{height:4px;}
.ts::-webkit-scrollbar-thumb{background:var(--bdr);border-radius:2px;}
table{width:100%;border-collapse:collapse;font-size:12px;min-width:480px;}
th{padding:8px 11px;text-align:left;font-family:var(--mono);font-size:10px;color:var(--dm);
  letter-spacing:.07em;text-transform:uppercase;background:var(--surf2);
  border-bottom:1px solid var(--bdr);font-weight:500;white-space:nowrap;}
td{padding:9px 11px;border-bottom:1px solid var(--bdr);color:var(--md);
  font-family:var(--mono);font-size:12px;white-space:nowrap;}
tr:last-child td{border-bottom:none;}
tr:hover td{background:rgba(255,255,255,.02);color:var(--tx);}
.hi{color:var(--tx);font-weight:500;} .ca{color:var(--am);} .cg{color:var(--gn);} .cr{color:var(--rd);}

/* badge */
.bg{display:inline-block;padding:2px 6px;border-radius:3px;font-family:var(--mono);font-size:10px;font-weight:500;}
.bgr{background:rgba(239,68,68,.15);color:var(--rd);border:1px solid rgba(239,68,68,.3);}
.bga{background:rgba(255,255,255,.04);color:var(--md);border:1px solid var(--bdr);}
.bgg{background:rgba(16,185,129,.15);color:var(--gn);border:1px solid rgba(16,185,129,.3);}
.bgd{background:rgba(255,255,255,.03);color:var(--dm);border:1px solid var(--bdr);}

/* form */
.fc{background:var(--surf);border:1px solid var(--bdr);border-radius:7px;padding:18px;margin-bottom:18px;}
.ft{font-family:var(--sans);font-size:14px;font-weight:700;margin-bottom:16px;letter-spacing:-.01em;}
.fg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(195px,1fr));gap:13px;}
@media(max-width:420px){.fg-grid{grid-template-columns:1fr;}}
.fg{display:flex;flex-direction:column;gap:5px;}
.fg.full{grid-column:1/-1;}
label{font-size:10px;color:var(--dm);font-family:var(--mono);letter-spacing:.06em;text-transform:uppercase;}
input,select,textarea{
  background:var(--surf2);border:1px solid var(--bdr);color:var(--tx);
  padding:9px 11px;border-radius:5px;font-family:var(--mono);font-size:13px;
  transition:border-color .2s;outline:none;width:100%;
}
input:focus,select:focus{border-color:var(--tx);}
input:disabled,select:disabled{opacity:.35;cursor:not-allowed;}
select option{background:var(--surf2);}
.hint{font-size:10px;color:var(--am);font-family:var(--mono);margin-top:3px;}

/* calc strip */
.cs{margin-top:13px;padding:10px 13px;background:var(--surf2);border-radius:5px;
  font-family:var(--mono);font-size:12px;display:flex;gap:16px;flex-wrap:wrap;}

/* buttons */
.btn{padding:9px 17px;border-radius:5px;font-family:var(--sans);font-size:13px;
  font-weight:700;letter-spacing:.01em;cursor:pointer;transition:all .2s;
  border:none;display:inline-flex;align-items:center;gap:5px;}
.btp{background:var(--tx);color:#000;} .btp:hover{background:#e0e0e0;}
.btp:disabled{opacity:.4;cursor:not-allowed;}
.btg{background:transparent;color:var(--md);border:1px solid var(--bdr);}
.btg:hover{border-color:var(--tx);color:var(--tx);}
.bts{background:transparent;color:var(--md);border:1px solid var(--bdr);}
.bts:hover{background:rgba(255,255,255,.06);color:var(--tx);}
.sm{padding:5px 10px;font-size:11px;}

/* alert */
.al{padding:10px 13px;border-radius:5px;font-size:12px;margin-bottom:13px;font-family:var(--mono);}
.alok{background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.3);color:var(--gn);}
.aler{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:var(--rd);}

/* driver card grid */
.dg{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:11px;margin-bottom:18px;}
@media(max-width:420px){.dg{grid-template-columns:1fr 1fr;}}
.dc{background:var(--surf);border:1px solid var(--bdr);border-radius:7px;padding:13px;}
.dn{font-family:var(--sans);font-size:14px;font-weight:700;margin-bottom:9px;letter-spacing:-.01em;}
.dr{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--bdr);font-size:11px;}
.dr:last-child{border-bottom:none;}
.dl{color:var(--dm);font-family:var(--mono);}
.dv{font-family:var(--mono);font-weight:500;}

/* today cards */
.tg{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:10px;margin-bottom:18px;}
@media(max-width:420px){.tg{grid-template-columns:1fr;}}
.tc{background:var(--surf);border:1px solid var(--bdr);border-radius:7px;padding:13px;}
.tc.alert{border-color:rgba(239,68,68,.4);background:rgba(239,68,68,.04);}
.td-name{font-family:var(--mono);font-size:12px;font-weight:600;margin-bottom:8px;
  display:flex;align-items:center;justify-content:space-between;}

/* mini bar chart */
.bc{display:flex;align-items:flex-end;gap:4px;height:90px;padding:0 2px;}
.bco{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;}
.br{width:100%;border-radius:3px 3px 0 0;min-height:3px;}
.blbl{font-family:var(--mono);font-size:9px;color:var(--dm);}
.bv{font-family:var(--mono);font-size:9px;color:var(--md);}

/* modal */
.mbg{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:500;
  display:flex;align-items:center;justify-content:center;padding:20px;}
.mo{background:var(--surf);border:1px solid var(--bdr);border-radius:9px;
  padding:22px;width:100%;max-width:360px;}
.mot{font-family:var(--mono);font-size:13px;font-weight:600;margin-bottom:14px;}
.moa{display:flex;gap:9px;margin-top:16px;justify-content:flex-end;}

/* login */
.lw{min-height:100vh;display:flex;align-items:center;justify-content:center;
  background:var(--bg);padding:20px;}
.lc{background:var(--surf);border:1px solid var(--bdr);border-radius:11px;
  padding:34px;width:100%;max-width:330px;}
.ll{width:42px;height:42px;background:var(--tx);border-radius:8px;
  display:flex;align-items:center;justify-content:center;
  font-family:var(--mono);font-weight:700;font-size:16px;color:#000;margin-bottom:16px;}
.lt{font-family:var(--sans);font-size:20px;font-weight:800;margin-bottom:3px;letter-spacing:-.02em;}
.ls{font-size:13px;color:var(--dm);margin-bottom:22px;}
.lr{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:16px;}
.rb{padding:13px 9px;border-radius:7px;text-align:center;cursor:pointer;
  border:1px solid var(--bdr);transition:all .2s;font-family:var(--mono);font-size:12px;}
.rb:hover{border-color:var(--tx);background:rgba(255,255,255,.05);}
.ri{font-size:20px;margin-bottom:5px;}
`;

// ── Micro components ──────────────────────────────────────────────────────────
function Stat({ label, value, color, delta, progress }) {
  const pct = Math.min(progress||0, 100);
  const pc  = progress>=100?"#f0f0f0":progress>=70?"#888888":"#444444";
  return (
    <div className="sc">
      <div className="sl">{label}</div>
      <div className={`sv${color?" "+color:""}`}>{value}</div>
      {delta && <div className="sd">{delta}</div>}
      {progress!=null && <div className="pw"><div className="pb" style={{ width:`${pct}%`, background:pc }} /></div>}
    </div>
  );
}

function Alrt({ type, msg }) {
  return msg ? <div className={`al ${type==="error"?"aler":"alok"}`}>{msg}</div> : null;
}

function MiniBar({ data, color="#ffffff" }) {
  const max = Math.max(...data.map(d=>d.v), 1);
  return (
    <div className="bc">
      {data.map((d,i)=>(
        <div className="bco" key={i}>
          <div className="bv">{d.v>999?`${(d.v/1000).toFixed(1)}k`:d.v}</div>
          <div className="br" style={{ height:`${(d.v/max)*80}px`, background:color, opacity:.5 }} />
          <div className="blbl">{d.l}</div>
        </div>
      ))}
    </div>
  );
}

function DateFilter({ value, onChange }) {
  return (
    <div className="fb">
      {[{id:"today",l:"Today"},{id:"week",l:"7 Days"},{id:"month",l:"30 Days"},{id:"all",l:"All"}].map(r=>(
        <button key={r.id} className={`fbtn${value===r.id?" on":""}`} onClick={()=>onChange(r.id)}>{r.l}</button>
      ))}
    </div>
  );
}

function useFilter(data, range) {
  return useMemo(()=>{
    const t = todayStr();
    if(range==="all") return data;
    const days = range==="today"?0:range==="week"?6:29;
    const c = new Date(); c.setDate(c.getDate()-days);
    const cs = c.toISOString().slice(0,10);
    return data.filter(d=>d.date>=cs && d.date<=t);
  },[data,range]);
}

// ── ADMIN: Overview ───────────────────────────────────────────────────────────
function AdminOverview({ stocks, expenses, drivers }) {
  const [range, setRange] = useState("week");
  const sd = useFilter(stocks,  range);
  const ed = useFilter(expenses, range);
  const dd = useFilter(drivers,  range);
  const t  = todayStr();

  const todayS   = stocks.find(s=>s.date===t)||{};
  const revenue  = sd.reduce((s,r)=>s+r.total_sold*BAG_PRICE,0);
  const expTotal = ed.reduce((s,e)=>s+e.amount,0);
  const lickage  = sd.reduce((s,r)=>s+r.lickage,0);
  const openDebt = dd.filter(d=>!d.debt_settled).reduce((s,d)=>s+(d.debt_amount||0),0);
  const todayPct = todayS.total_sold?Math.round((todayS.total_sold/DAILY_TARGET)*100):0;

  return (
    <div>
      <div className="ph">
        <div><div className="pt">Overview</div><div className="ps">{new Date().toDateString()}</div></div>
      </div>

      <div className="sg">
        <Stat label="Today Sold"      value={fmt(todayS.total_sold||0)}             color="am" delta={`Target: ${fmt(DAILY_TARGET)}`} progress={todayPct} />
        <Stat label="Today Revenue"   value={naira((todayS.total_sold||0)*BAG_PRICE)} color="gn" />
        <Stat label="Today Lickage"   value={fmt(todayS.lickage||0)}                color="rd" delta="bags damaged" />
        <Stat label="Open Debt"       value={naira(openDebt)}                       color="rd" delta="unpaid customers" />
      </div>

      <DateFilter value={range} onChange={setRange} />

      <div className="sg">
        <Stat label="Revenue"    value={naira(revenue)}          color="gn" />
        <Stat label="Expenses"   value={naira(expTotal)}         color="rd" />
        <Stat label="Est. Profit" value={naira(revenue-expTotal)} color="am" />
        <Stat label="Lickage Loss" value={naira(lickage*BAG_PRICE)} color="rd" delta={`${lickage} bags`} />
      </div>

      <div className="tw">
        <div className="th"><span className="tt">📊 Daily Sales Trend</span></div>
        <div style={{ padding:"12px 14px 6px" }}>
          <MiniBar data={[...stocks].reverse().slice(-7).map(d=>({ l:d.date.slice(5), v:d.total_sold }))} />
        </div>
      </div>

      <div className="tw">
        <div className="th">
          <span className="tt">Stock Entries</span>
          <button className="btn btg sm" onClick={()=>exportCSV(sd,"stock.csv")}>↓ CSV</button>
        </div>
        <div className="ts">
          <table>
            <thead><tr><th>Date</th><th>Operator</th><th>Produce</th><th>Stock Out</th><th>Returns</th><th>Lickage</th><th>Sold</th><th>Revenue</th></tr></thead>
            <tbody>
              {sd.map(r=>(
                <tr key={r.id}>
                  <td className="hi">{r.date}</td><td>{r.operator||"—"}</td>
                  <td>{fmt(r.produce)}</td><td>{fmt(r.stock_out)}</td>
                  <td>{fmt(r.returns)}</td><td className={r.lickage>5?"cr":"ca"}>{r.lickage}</td>
                  <td className="cg hi">{fmt(r.total_sold)}</td><td className="ca">{naira(r.total_sold*BAG_PRICE)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN: Drivers ────────────────────────────────────────────────────────────
function AdminDrivers({ drivers, onSettle }) {
  const [range, setRange] = useState("week");
  const [settle, setSettle] = useState(null);
  const dd = useFilter(drivers, range);
  const t  = todayStr();

  const summary = {};
  dd.forEach(d=>{
    if(!summary[d.driver_name]) summary[d.driver_name]={ sold:0,cash:0,debt:0,settled:0,lickage:0,days:0 };
    const s=summary[d.driver_name];
    s.sold    += d.bags_loaded-d.bags_returned-d.lickage;
    s.cash    += d.cash_collected;
    s.debt    += d.debt_settled?0:(d.debt_amount||0);
    s.settled += d.debt_settled?(d.debt_amount||0):0;
    s.lickage += d.lickage; s.days++;
  });

  const todayD  = drivers.filter(d=>d.date===t);
  const pending = drivers.filter(d=>d.debt_amount>0&&!d.debt_settled)
                         .sort((a,b)=>(a.debt_payment_date||"").localeCompare(b.debt_payment_date||""));

  return (
    <div>
      <div className="ph"><div><div className="pt">Driver Tracking</div><div className="ps">Sales, debt & accountability</div></div></div>

      {/* Today snapshot */}
      <div style={{ marginBottom:8, fontFamily:"var(--mono)", fontSize:10, color:"var(--dm)", letterSpacing:".09em", textTransform:"uppercase" }}>Today's Drivers</div>
      <div className="tg">
        {todayD.length===0 && <div style={{ color:"var(--dm)", fontFamily:"var(--mono)", fontSize:12 }}>No entries for today yet.</div>}
        {todayD.map(d=>{
          const sold=d.bags_loaded-d.bags_returned-d.lickage;
          const diff=d.cash_collected+(d.debt_amount||0)-sold*BAG_PRICE;
          return (
            <div className={`tc${diff<0?" alert":""}`} key={d.id}>
              <div className="td-name"><span>🚛 {d.driver_name}</span>{diff<0&&<span className="bg bgr">SHORT</span>}</div>
              <div className="dr"><span className="dl">Sold</span><span className="dv cg">{fmt(sold)}</span></div>
              <div className="dr"><span className="dl">Cash</span><span className="dv ca">{naira(d.cash_collected)}</span></div>
              {d.debt_amount>0&&<div className="dr"><span className="dl">Debt</span><span className="dv cr">{naira(d.debt_amount)}</span></div>}
              <div className="dr"><span className="dl">Diff</span><span className={`dv ${diff<0?"cr":diff>0?"cg":""}`}>{naira(Math.abs(diff))} {diff<0?"↓":diff>0?"↑":"✓"}</span></div>
            </div>
          );
        })}
      </div>

      {/* Pending debts */}
      {pending.length>0&&(
        <div className="tw">
          <div className="th"><span className="tt">⚠ Pending Debts</span></div>
          <div className="ts">
            <table>
              <thead><tr><th>Driver</th><th>Amount</th><th>Due</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {pending.map((d,i)=>{
                  const ov=d.debt_payment_date&&d.debt_payment_date<t;
                  return (
                    <tr key={i}>
                      <td className="hi">{d.driver_name}</td>
                      <td className="cr">{naira(d.debt_amount)}</td>
                      <td className={ov?"cr":"ca"}>{d.debt_payment_date||"—"}</td>
                      <td><span className={`bg ${ov?"bgr":"bga"}`}>{ov?"OVERDUE":"PENDING"}</span></td>
                      <td><button className="btn bts sm" onClick={()=>setSettle(d)}>Mark Paid</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DateFilter value={range} onChange={setRange} />

      <div className="dg">
        {Object.entries(summary).map(([name,s])=>(
          <div className="dc" key={name}>
            <div className="dn">🚛 {name}</div>
            <div className="dr"><span className="dl">Sold</span><span className="dv cg">{fmt(s.sold)} bags</span></div>
            <div className="dr"><span className="dl">Cash</span><span className="dv ca">{naira(s.cash)}</span></div>
            <div className="dr"><span className="dl">Open Debt</span><span className="dv cr">{naira(s.debt)}</span></div>
            <div className="dr"><span className="dl">Settled</span><span className="dv cg">{naira(s.settled)}</span></div>
            <div className="dr"><span className="dl">Lickage</span><span className="dv cr">{s.lickage} bags</span></div>
            <div className="dr"><span className="dl">Avg/Day</span><span className="dv">{Math.round(s.sold/Math.max(s.days,1))} bags</span></div>
          </div>
        ))}
      </div>

      <div className="tw">
        <div className="th">
          <span className="tt">Full Driver Log</span>
          <button className="btn btg sm" onClick={()=>exportCSV(dd,"drivers.csv")}>↓ CSV</button>
        </div>
        <div className="ts">
          <table>
            <thead><tr><th>Date</th><th>Driver</th><th>Operator</th><th>Loaded</th><th>Returned</th><th>Lickage</th><th>Sold</th><th>Cash</th><th>Debt</th><th>Pay Date</th><th>Status</th><th>Diff</th></tr></thead>
            <tbody>
              {dd.map(d=>{
                const sold=d.bags_loaded-d.bags_returned-d.lickage;
                const diff=d.cash_collected+(d.debt_amount||0)-sold*BAG_PRICE;
                const ov=!d.debt_settled&&d.debt_payment_date&&d.debt_payment_date<t;
                return (
                  <tr key={d.id}>
                    <td>{d.date}</td><td className="hi">{d.driver_name}</td><td>{d.operator||"—"}</td>
                    <td>{fmt(d.bags_loaded)}</td><td>{fmt(d.bags_returned)}</td>
                    <td className={d.lickage>0?"cr":""}>{d.lickage}</td>
                    <td className="cg">{fmt(sold)}</td><td className="ca">{naira(d.cash_collected)}</td>
                    <td className={d.debt_amount>0?"cr":""}>{d.debt_amount>0?naira(d.debt_amount):"—"}</td>
                    <td className={ov?"cr":""}>{d.debt_payment_date||"—"}</td>
                    <td>
                      {d.debt_amount>0
                        ?<span className={`bg ${d.debt_settled?"bgg":ov?"bgr":"bga"}`}>{d.debt_settled?"PAID":ov?"OVERDUE":"PENDING"}</span>
                        :<span className="bg bgd">N/A</span>}
                    </td>
                    <td className={diff<0?"cr":diff>0?"cg":""}>{diff!==0?naira(Math.abs(diff)):diff<0?"↓ "+naira(Math.abs(diff)):"✓"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {settle&&(
        <div className="mbg" onClick={()=>setSettle(null)}>
          <div className="mo" onClick={e=>e.stopPropagation()}>
            <div className="mot">✓ Mark Debt as Paid</div>
            <div style={{ fontFamily:"var(--mono)", fontSize:13, color:"var(--md)", lineHeight:1.8 }}>
              <div>Driver: <span style={{ color:"var(--tx)" }}>{settle.driver_name}</span></div>
              <div>Amount: <span style={{ color:"var(--gn)" }}>{naira(settle.debt_amount)}</span></div>
              <div>Due: <span style={{ color:"var(--md)" }}>{settle.debt_payment_date}</span></div>
            </div>
            <div style={{ marginTop:12, fontSize:12, color:"var(--dm)", fontFamily:"var(--mono)" }}>Confirm debt has been collected and settled.</div>
            <div className="moa">
              <button className="btn btg sm" onClick={()=>setSettle(null)}>Cancel</button>
              <button className="btn btp sm" onClick={()=>{ onSettle(settle.id); setSettle(null); }}>Confirm Paid</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ADMIN: Expenses ───────────────────────────────────────────────────────────
function AdminExpenses({ expenses }) {
  const [range, setRange] = useState("month");
  const ed = useFilter(expenses, range);
  const byCat = {};
  ed.forEach(e=>{ byCat[e.category]=(byCat[e.category]||0)+e.amount; });
  return (
    <div>
      <div className="ph"><div><div className="pt">Expenses</div><div className="ps">All business costs</div></div></div>
      <DateFilter value={range} onChange={setRange} />
      <div className="sg">
        {Object.entries(byCat).map(([c,a])=><Stat key={c} label={c} value={naira(a)} color="rd" />)}
        <Stat label="Total" value={naira(ed.reduce((s,e)=>s+e.amount,0))} color="am" />
      </div>
      <div className="tw">
        <div className="th"><span className="tt">Expense Log</span><button className="btn btg sm" onClick={()=>exportCSV(ed,"expenses.csv")}>↓ CSV</button></div>
        <div className="ts">
          <table>
            <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Note</th><th>By</th></tr></thead>
            <tbody>{ed.map(e=><tr key={e.id}><td>{e.date}</td><td className="hi">{e.category}</td><td className="cr">{naira(e.amount)}</td><td>{e.note}</td><td>{e.staff}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN: Lickage ────────────────────────────────────────────────────────────
function AdminLickage({ stocks }) {
  const [range, setRange] = useState("month");
  const sd = useFilter(stocks, range);
  const total = sd.reduce((s,r)=>s+r.lickage,0);
  const avg   = (total/Math.max(sd.length,1)).toFixed(1);
  const worst = [...sd].sort((a,b)=>b.lickage-a.lickage)[0];
  const byOp  = {};
  sd.forEach(r=>{ byOp[r.operator||"?"]=(byOp[r.operator||"?"]||0)+r.lickage; });

  return (
    <div>
      <div className="ph"><div><div className="pt">Lickage Analysis</div><div className="ps">Damaged bag trends</div></div></div>
      <DateFilter value={range} onChange={setRange} />
      <div className="sg">
        <Stat label="Total Lickage" value={fmt(total)}            color="rd" delta="bags lost" />
        <Stat label="Avg Per Day"   value={avg}                   color="am" delta="bags/day" />
        <Stat label="Est. Loss"     value={naira(total*BAG_PRICE)} color="rd" />
        <Stat label="Worst Day"     value={worst?.date||"—"}      delta={`${worst?.lickage||0} bags`} />
      </div>
      <div style={{ marginBottom:8, fontFamily:"var(--mono)", fontSize:10, color:"var(--dm)", letterSpacing:".08em", textTransform:"uppercase" }}>By Operator</div>
      <div className="sg" style={{ marginBottom:18 }}>
        {Object.entries(byOp).map(([op,lk])=><Stat key={op} label={op} value={`${fmt(lk)} bags`} color="rd" delta={naira(lk*BAG_PRICE)+" lost"} />)}
      </div>
      <div className="tw">
        <div className="th"><span className="tt">Lickage Trend (last 7 days)</span></div>
        <div style={{ padding:"12px 14px 6px" }}>
          <MiniBar data={[...stocks].reverse().slice(-7).map(d=>({ l:d.date.slice(5), v:d.lickage }))} color="#ef4444" />
        </div>
      </div>
      <div className="tw">
        <div className="th"><span className="tt">Daily Detail</span></div>
        <div className="ts">
          <table>
            <thead><tr><th>Date</th><th>Operator</th><th>Lickage</th><th>Total Sold</th><th>% Loss</th><th>Value Lost</th></tr></thead>
            <tbody>{sd.map(r=>{
              const pct=r.total_sold>0?((r.lickage/(r.total_sold+r.lickage))*100).toFixed(1):0;
              return <tr key={r.id}><td>{r.date}</td><td>{r.operator||"—"}</td><td className={r.lickage>5?"cr":"ca"}>{r.lickage}</td><td>{fmt(r.total_sold)}</td><td className={pct>2?"cr":""}>{pct}%</td><td className="cr">{naira(r.lickage*BAG_PRICE)}</td></tr>;
            })}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN: Operators ──────────────────────────────────────────────────────────
function AdminOperators({ stocks }) {
  const [range, setRange] = useState("month");
  const sd = useFilter(stocks, range);
  const byOp = {};
  sd.forEach(r=>{
    const op=r.operator||"Unknown";
    if(!byOp[op]) byOp[op]={ produce:0,sold:0,lickage:0,days:0 };
    byOp[op].produce+=r.produce; byOp[op].sold+=r.total_sold;
    byOp[op].lickage+=r.lickage; byOp[op].days++;
  });
  return (
    <div>
      <div className="ph"><div><div className="pt">Operator Output</div><div className="ps">Production per machine operator</div></div></div>
      <DateFilter value={range} onChange={setRange} />
      <div className="dg">
        {Object.entries(byOp).map(([op,s])=>(
          <div className="dc" key={op}>
            <div className="dn">⚙ {op}</div>
            <div className="dr"><span className="dl">Produced</span><span className="dv ca">{fmt(s.produce)} bags</span></div>
            <div className="dr"><span className="dl">Sold</span><span className="dv cg">{fmt(s.sold)} bags</span></div>
            <div className="dr"><span className="dl">Lickage</span><span className="dv cr">{s.lickage} bags</span></div>
            <div className="dr"><span className="dl">Lickage %</span><span className="dv cr">{s.produce>0?((s.lickage/s.produce)*100).toFixed(2):0}%</span></div>
            <div className="dr"><span className="dl">Days</span><span className="dv">{s.days}</span></div>
            <div className="dr"><span className="dl">Avg/Day</span><span className="dv">{Math.round(s.produce/Math.max(s.days,1))} bags</span></div>
          </div>
        ))}
      </div>
      <div className="tw">
        <div className="th"><span className="tt">Daily Operator Log</span></div>
        <div className="ts">
          <table>
            <thead><tr><th>Date</th><th>Operator</th><th>Produced</th><th>Sold</th><th>Lickage</th><th>Lickage %</th></tr></thead>
            <tbody>{sd.map(r=>{
              const pct=r.produce>0?((r.lickage/r.produce)*100).toFixed(2):0;
              return <tr key={r.id}><td>{r.date}</td><td className="hi">{r.operator||"—"}</td><td>{fmt(r.produce)}</td><td className="cg">{fmt(r.total_sold)}</td><td className={r.lickage>5?"cr":"ca"}>{r.lickage}</td><td className={pct>1.5?"cr":""}>{pct}%</td></tr>;
            })}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN: Staff Log ──────────────────────────────────────────────────────────
function AdminStaffLog({ stocks, expenses }) {
  const entries = [
    ...stocks.map(s=>({ date:s.date, action:"Stock Entry", detail:`${fmt(s.total_sold)} bags sold · Op: ${s.operator||"?"}`, by:"Manager" })),
    ...expenses.map(e=>({ date:e.date, action:"Expense", detail:`${e.category} — ${naira(e.amount)}`, by:e.staff })),
  ].sort((a,b)=>b.date.localeCompare(a.date));
  return (
    <div>
      <div className="ph"><div><div className="pt">Staff Log</div><div className="ps">All manager inputs</div></div></div>
      <div className="tw">
        <div className="th"><span className="tt">Activity Feed</span></div>
        <div className="ts">
          <table>
            <thead><tr><th>Date</th><th>Action</th><th>Detail</th><th>By</th></tr></thead>
            <tbody>{entries.map((e,i)=><tr key={i}><td>{e.date}</td><td className="ca">{e.action}</td><td>{e.detail}</td><td>{e.by}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── STAFF: Stock Entry ────────────────────────────────────────────────────────
function StaffStock({ onSave }) {
  const t = todayStr();
  const blank = { date:t, operator:"", produce:"", in_stock:"", stock_out:"", returns:"", lickage:"" };
  const [form, setForm] = useState(blank);
  const [al, setAl]     = useState(null);
  const set = (k,v)=>setForm(f=>({...f,[k]:v}));
  const ts = (Number(form.in_stock)||0)+(Number(form.stock_out)||0);
  const sold= Math.max((Number(form.stock_out)||0)-(Number(form.returns)||0)-(Number(form.lickage)||0),0);
  const pct = Math.round((sold/DAILY_TARGET)*100);

  const submit = ()=>{
    if(!form.produce||!form.in_stock||!form.stock_out||!form.operator)
      return setAl({ type:"error", msg:"Date, operator, produce, in stock, and stock out are required." });
    onSave({ ...form, total_stock:ts, total_sold:sold });
    setAl({ type:"ok", msg:`Saved! ${fmt(sold)} bags sold today.` });
    setForm(blank);
  };

  return (
    <div>
      <div className="ph"><div><div className="pt">Daily Stock Entry</div><div className="ps">Record production and sales</div></div></div>
      <Alrt type={al?.type} msg={al?.msg} />
      <div className="fc">
        <div className="ft">📦 Stock Form</div>
        <div className="fg-grid">
          <div className="fg"><label>Date *</label><input type="date" value={form.date} onChange={e=>set("date",e.target.value)} /></div>
          <div className="fg">
            <label>Operator *</label>
            <select value={form.operator} onChange={e=>set("operator",e.target.value)}>
              <option value="">Select operator</option>
              {OPERATORS.map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="fg"><label>Produce (bags made) *</label><input type="number" placeholder="e.g. 640" value={form.produce} onChange={e=>set("produce",e.target.value)} /></div>
          <div className="fg"><label>In Stock (opening) *</label><input type="number" placeholder="e.g. 500" value={form.in_stock} onChange={e=>set("in_stock",e.target.value)} /></div>
          <div className="fg"><label>Stock Out (to drivers) *</label><input type="number" placeholder="e.g. 760" value={form.stock_out} onChange={e=>set("stock_out",e.target.value)} /></div>
          <div className="fg"><label>Returns (unsold)</label><input type="number" placeholder="e.g. 30" value={form.returns} onChange={e=>set("returns",e.target.value)} /></div>
          <div className="fg"><label>Lickage (damaged)</label><input type="number" placeholder="e.g. 4" value={form.lickage} onChange={e=>set("lickage",e.target.value)} /></div>
        </div>
        {form.stock_out&&(
          <div className="cs">
            <span>Total Stock: <span style={{ color:"var(--tx)" }}>{fmt(ts)}</span></span>
            <span>Sold: <span style={{ color:"var(--tx)" }}>{fmt(sold)}</span></span>
            <span>vs Target: <span style={{ color:pct>=100?"var(--tx)":pct>=70?"var(--md)":"var(--dm)" }}>{pct}%</span></span>
          </div>
        )}
        <div style={{ marginTop:16 }}><button className="btn btp" onClick={submit}>✓ Save Entry</button></div>
      </div>
    </div>
  );
}

// ── STAFF: Expense ────────────────────────────────────────────────────────────
function StaffExpense({ onSave }) {
  const t = todayStr();
  const blank = { date:t, category:"", amount:"", note:"" };
  const [form, setForm] = useState(blank);
  const [al, setAl]     = useState(null);
  const set = (k,v)=>setForm(f=>({...f,[k]:v}));
  const submit = ()=>{
    if(!form.category||!form.amount) return setAl({ type:"error", msg:"Category and amount are required." });
    onSave({ ...form, amount:Number(form.amount), staff:"Manager" });
    setAl({ type:"ok", msg:`Expense of ${naira(form.amount)} saved.` });
    setForm(blank);
  };
  return (
    <div>
      <div className="ph"><div><div className="pt">Log Expense</div><div className="ps">Fuel, repairs, packaging and more</div></div></div>
      <Alrt type={al?.type} msg={al?.msg} />
      <div className="fc">
        <div className="ft">💸 Expense Form</div>
        <div className="fg-grid">
          <div className="fg"><label>Date *</label><input type="date" value={form.date} onChange={e=>set("date",e.target.value)} /></div>
          <div className="fg">
            <label>Category *</label>
            <select value={form.category} onChange={e=>set("category",e.target.value)}>
              <option value="">Select</option>
              {["Fuel","Repairs","Packaging","Maintenance","Salary","Utilities","Other"].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="fg"><label>Amount (₦) *</label><input type="number" placeholder="e.g. 15000" value={form.amount} onChange={e=>set("amount",e.target.value)} /></div>
          <div className="fg full"><label>Note</label><input type="text" placeholder="e.g. 2 trucks fuelled" value={form.note} onChange={e=>set("note",e.target.value)} /></div>
        </div>
        <div style={{ marginTop:16 }}><button className="btn btp" onClick={submit}>✓ Save Expense</button></div>
      </div>
    </div>
  );
}

// ── STAFF: Driver Log ─────────────────────────────────────────────────────────
function StaffDriver({ onSave }) {
  const t = todayStr();
  const blank = { date:t, driver_name:"", operator:"", bags_loaded:"", bags_returned:"", lickage:"", cash_collected:"", debt_amount:"", debt_payment_date:"" };
  const [form, setForm] = useState(blank);
  const [al, setAl]     = useState(null);
  const set = (k,v)=>setForm(f=>({...f,[k]:v}));
  const sold    = (Number(form.bags_loaded)||0)-(Number(form.bags_returned)||0)-(Number(form.lickage)||0);
  const expected= sold*BAG_PRICE;
  const totalIn = (Number(form.cash_collected)||0)+(Number(form.debt_amount)||0);
  const diff    = totalIn-expected;
  const hasDebt = Number(form.debt_amount)>0;

  const submit = ()=>{
    if(!form.driver_name||!form.bags_loaded||!form.operator)
      return setAl({ type:"error", msg:"Driver, operator and bags loaded are required." });
    if(hasDebt&&!form.debt_payment_date)
      return setAl({ type:"error", msg:"Set a payment date when there is a debt." });
    onSave({ ...form, bags_loaded:Number(form.bags_loaded), bags_returned:Number(form.bags_returned)||0,
      lickage:Number(form.lickage)||0, cash_collected:Number(form.cash_collected)||0,
      debt_amount:Number(form.debt_amount)||0, debt_settled:false });
    setAl({ type:"ok", msg:`Driver log saved for ${form.driver_name}.` });
    setForm(blank);
  };

  return (
    <div>
      <div className="ph"><div><div className="pt">Driver Log</div><div className="ps">Daily loading, sales and debt</div></div></div>
      <Alrt type={al?.type} msg={al?.msg} />
      <div className="fc">
        <div className="ft">🚛 Driver Entry</div>
        <div className="fg-grid">
          <div className="fg"><label>Date *</label><input type="date" value={form.date} onChange={e=>set("date",e.target.value)} /></div>
          <div className="fg">
            <label>Driver *</label>
            <select value={form.driver_name} onChange={e=>set("driver_name",e.target.value)}>
              <option value="">Select driver</option>
              {DRIVERS.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="fg">
            <label>Operator *</label>
            <select value={form.operator} onChange={e=>set("operator",e.target.value)}>
              <option value="">Select operator</option>
              {OPERATORS.map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="fg"><label>Bags Loaded *</label><input type="number" placeholder="e.g. 200" value={form.bags_loaded} onChange={e=>set("bags_loaded",e.target.value)} /></div>
          <div className="fg"><label>Bags Returned</label><input type="number" placeholder="e.g. 12" value={form.bags_returned} onChange={e=>set("bags_returned",e.target.value)} /></div>
          <div className="fg"><label>Lickage</label><input type="number" placeholder="e.g. 2" value={form.lickage} onChange={e=>set("lickage",e.target.value)} /></div>
          <div className="fg"><label>Cash Collected (₦)</label><input type="number" placeholder="e.g. 22400" value={form.cash_collected} onChange={e=>set("cash_collected",e.target.value)} /></div>
          <div className="fg">
            <label>Debt Amount (₦)</label>
            <input type="number" placeholder="if any customer owes" value={form.debt_amount} onChange={e=>set("debt_amount",e.target.value)} />
          </div>
          <div className="fg">
            <label>Debt Payment Date {hasDebt?"*":""}</label>
            <input type="date" value={form.debt_payment_date} onChange={e=>set("debt_payment_date",e.target.value)} disabled={!hasDebt} />
            {hasDebt&&<span className="hint">When will driver collect this debt?</span>}
          </div>
        </div>
        {form.bags_loaded&&(
          <div className="cs">
            <span>Sold: <span style={{ color:"var(--tx)" }}>{fmt(Math.max(sold,0))}</span></span>
            <span>Expected: <span style={{ color:"var(--md)" }}>{naira(expected)}</span></span>
            {hasDebt&&<span>Debt: <span style={{ color:"var(--md)" }}>{naira(Number(form.debt_amount))}</span></span>}
            {form.cash_collected&&<span>Diff: <span style={{ color:diff<0?"var(--rd)":"var(--gn)" }}>{naira(Math.abs(diff))} {diff<0?"⚠ SHORT":diff>0?"↑ OVER":"✓ EXACT"}</span></span>}
          </div>
        )}
        <div style={{ marginTop:16 }}><button className="btn btp" onClick={submit}>✓ Save Driver Log</button></div>
      </div>
    </div>
  );
}

// ── Nav config ────────────────────────────────────────────────────────────────
const ADMIN_NAV = [
  { id:"overview",  label:"Overview",  icon:"◈" },
  { id:"drivers",   label:"Drivers",   icon:"🚛" },
  { id:"expenses",  label:"Expenses",  icon:"💸" },
  { id:"lickage",   label:"Lickage",   icon:"📉" },
  { id:"operators", label:"Operators", icon:"⚙" },
  { id:"staff-log", label:"Staff Log", icon:"📋" },
];
const STAFF_NAV = [
  { id:"stock",   label:"Stock",   icon:"📦" },
  { id:"expense", label:"Expense", icon:"💸" },
  { id:"driver",  label:"Driver",  icon:"🚛" },
];

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [role,    setRole]    = useState(null);
  const [page,    setPage]    = useState("overview");
  const [stocks,  setStocks]  = useState(MOCK_STOCK);
  const [expenses,setExp]     = useState(MOCK_EXPENSES);
  const [drivers, setDrivers] = useState(MOCK_DRIVERS);

  const addStock   = e => setStocks(p=>[{...e,id:Date.now()},...p]);
  const addExpense = e => setExp(p=>[{...e,id:Date.now()},...p]);
  const addDriver  = e => setDrivers(p=>[{...e,id:Date.now()},...p]);
  const settleDebt = id=> setDrivers(p=>p.map(d=>d.id===id?{...d,debt_settled:true}:d));

  const nav = role==="admin"?ADMIN_NAV:STAFF_NAV;

  if(!role) return (
    <>
      <style>{css}</style>
      <div className="lw">
        <div className="lc">
          <div className="ll">PW</div>
          <div className="lt">Pure Water Co.</div>
          <div className="ls">Business Management System</div>
          <div style={{ fontSize:12, color:"var(--dm)", fontFamily:"var(--mono)" }}>Select your role to continue</div>
          <div className="lr">
            <div className="rb" onClick={()=>{ setRole("admin"); setPage("overview"); }}>
              <div className="ri">👑</div><div style={{ fontWeight:600 }}>Admin</div>
              <div style={{ fontSize:10, color:"var(--dm)", marginTop:2 }}>Owner view</div>
            </div>
            <div className="rb" onClick={()=>{ setRole("staff"); setPage("stock"); }}>
              <div className="ri">📋</div><div style={{ fontWeight:600 }}>Staff</div>
              <div style={{ fontSize:10, color:"var(--dm)", marginTop:2 }}>Manager input</div>
            </div>
          </div>
          <div style={{ marginTop:16, fontSize:11, color:"var(--dm)", fontFamily:"var(--mono)", textAlign:"center" }}>
            Demo mode · connect Supabase to persist data
          </div>
        </div>
      </div>
    </>
  );

  const renderPage = () => {
    if(role==="admin") {
      if(page==="overview")  return <AdminOverview stocks={stocks} expenses={expenses} drivers={drivers} />;
      if(page==="drivers")   return <AdminDrivers drivers={drivers} onSettle={settleDebt} />;
      if(page==="expenses")  return <AdminExpenses expenses={expenses} />;
      if(page==="lickage")   return <AdminLickage stocks={stocks} />;
      if(page==="operators") return <AdminOperators stocks={stocks} />;
      if(page==="staff-log") return <AdminStaffLog stocks={stocks} expenses={expenses} />;
    } else {
      if(page==="stock")   return <StaffStock onSave={addStock} />;
      if(page==="expense") return <StaffExpense onSave={addExpense} />;
      if(page==="driver")  return <StaffDriver onSave={addDriver} />;
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        <div className="topbar">
          <div className="brand">
            <div className="logo">PW</div>
            <div><div className="bname">Pure Water Co.</div><div className="bsub">Management</div></div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <div className={`rpill ${role==="admin"?"ra":"rs"}`}>{role==="admin"?"👑 ADMIN":"📋 STAFF"}</div>
            <button className="bswitch" onClick={()=>setRole(null)}>Switch</button>
          </div>
        </div>

        <div className="body">
          {/* Desktop sidebar */}
          <div className="sidebar">
            <div className="sid-sec">{role==="admin"?"Dashboard":"Entry"}</div>
            {nav.map(n=>(
              <div key={n.id} className={`ni${page===n.id?" on":""}`} onClick={()=>setPage(n.id)}>
                <span className="ni-ic">{n.icon}</span>{n.label}
              </div>
            ))}
          </div>

          <div className="content">{renderPage()}</div>
        </div>

        {/* Mobile bottom nav */}
        <div className="bnav">
          <div className="bnav-inner">
            {nav.map(n=>(
              <div key={n.id} className={`bni${page===n.id?" on":""}`} onClick={()=>setPage(n.id)}>
                <span className="bni-ic">{n.icon}</span>{n.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}