"use client";
import {useEffect,useMemo,useState} from "react";

function analyze({name,price,uses,already,need,impulse,waited}) {
  const p=Math.max(0,Number(price)||0), u=Math.max(1,Number(uses)||1);
  let score=50, reasons=[];
  if(already==="yes"){score-=30; reasons.push("You already own something that can probably do the job.");}
  if(need==="yes"){score+=20; reasons.push("You said you genuinely need it.");}
  if(need==="no"){score-=20; reasons.push("You said you don't actually need it.");}
  if(impulse==="yes"){score-=20; reasons.push("This looks like an impulse purchase.");}
  if(waited==="yes"){score+=10; reasons.push("You've already waited before buying it.");}
  if(p>=200) {score-=10; reasons.push("It's a large purchase, so the bar should be higher.");}
  const perUse=p/u;
  if(u>=50) score+=10;
  if(u<5) {score-=10; reasons.push("You expect to use it only a few times.");}
  score=Math.max(0,Math.min(100,score));
  const verdict=score>=65?"BUY":score>=40?"WAIT":"DON'T BUY";
  const color=verdict==="BUY"?"green":verdict==="WAIT"?"yellow":"red";
  const opener=name?`For "${name}",`:"For this purchase,";
  return {score,verdict,color,perUse,reasons:[...reasons,`${opener} that's about $${perUse.toFixed(2)} per expected use.`]};
}

export default function Home(){
  const [form,setForm]=useState({name:"",price:"",uses:"10",already:"no",need:"unsure",impulse:"no",waited:"no"});
  const [result,setResult]=useState(null),[saved,setSaved]=useState([]);
  useEffect(()=>{try{setSaved(JSON.parse(localStorage.getItem("bwd-saved")||"[]"))}catch{}},[]);
  const update=(k,v)=>setForm(f=>({...f,[k]:v}));
  function submit(e){e.preventDefault();const r=analyze(form);const item={...form,...r,date:new Date().toLocaleDateString()};setResult(item);setSaved(s=>{const n=[item,...s].slice(0,20);localStorage.setItem("bwd-saved",JSON.stringify(n));return n})}
  function clear(){localStorage.removeItem("bwd-saved");setSaved([])}
  return <main>
    <nav><div className="logo">🛒 <b>Buy / Wait / Don&apos;t Buy</b></div><a href="#pricing">$3/month</a></nav>
    <section className="hero"><div className="tag">YOUR IMPULSE-BUYING BOUNCER</div><h1>Should I<br/><span>buy this?</span></h1><p>Send us the purchase you&apos;re thinking about. Get a brutally simple answer: <b>BUY, WAIT, or DON&apos;T BUY.</b></p><a className="button" href="#analyzer">Judge my purchase ↓</a></section>
    <section id="analyzer" className="card">
      <div className="eyebrow">THE 30-SECOND TEST</div><h2>What are you thinking about buying?</h2>
      <form onSubmit={submit}>
        <input value={form.name} onChange={e=>update("name",e.target.value)} placeholder="e.g. $180 headphones"/>
        <div className="grid2"><label>Price ($)<input required type="number" min="0" step="0.01" value={form.price} onChange={e=>update("price",e.target.value)}/></label><label>Expected uses<input required type="number" min="1" value={form.uses} onChange={e=>update("uses",e.target.value)}/></label></div>
        <Question label="Do you already own something similar?" value={form.already} set={v=>update("already",v)}/>
        <Question label="Do you actually need it?" value={form.need} set={v=>update("need",v)} options={[["yes","Yes"],["unsure","Not sure"],["no","No"]]}/>
        <Question label="Are you buying because you&apos;re bored / emotional?" value={form.impulse} set={v=>update("impulse",v)}/>
        <Question label="Have you waited at least 7 days?" value={form.waited} set={v=>update("waited",v)}/>
        <button className="judge">Judge my purchase</button>
      </form>
    </section>
    {result&&<section className={"result "+result.color}><div className="verdict">{result.verdict}</div><div className="score">{result.score}/100</div><p className="per">About <b>${result.perUse.toFixed(2)}</b> per expected use.</p><div className="reasons">{result.reasons.map((x,i)=><div key={i}>• {x}</div>)}</div><p className="disclaimer">This is a decision aid, not financial advice.</p></section>}
    <section className="feature"><div><div className="eyebrow">THE DIFFERENCE</div><h2>Before you buy,<br/>ask yourself.</h2></div><div className="features"><article><b>01</b><h3>Regret score</h3><p>Turn your answers into one simple 0–100 purchase score.</p></article><article><b>02</b><h3>Cost per use</h3><p>See what that “cheap” purchase really costs every time you use it.</p></article><article><b>03</b><h3>Purchase history</h3><p>Keep a private history of decisions so you can spot your spending patterns.</p></article></div></section>
    <section id="pricing" className="pricing"><div className="eyebrow">PRO</div><h2>Spend less<br/>on stuff you don&apos;t need.</h2><p>$3/month for unlimited purchase checks, saved history, and future cloud sync.</p><button className="button" onClick={()=>alert("Stripe Checkout gets connected here after you connect your Stripe account.")}>Get Pro — $3/month</button><small>Cancel anytime.</small></section>
    <section className="history"><div className="history-head"><h2>Your recent decisions</h2><button onClick={clear}>Clear</button></div>{saved.length===0?<p className="muted">Your decisions will appear here.</p>:saved.map((x,i)=><div className="history-row" key={i}><b>{x.verdict}</b><span>{x.name||"Purchase"} · ${Number(x.price).toFixed(2)}</span><small>{x.date}</small></div>)}</section>
    <footer>Buy / Wait / Don&apos;t Buy © 2026 · Stop buying stuff you don&apos;t need.</footer>
  </main>
}
function Question({label,value,set,options=[["yes","Yes"],["no","No"]]}){return <fieldset><legend dangerouslySetInnerHTML={{__html:label}}></legend><div className="choices">{options.map(([v,t])=><button type="button" className={value===v?"selected":""} onClick={()=>set(v)} key={v}>{t}</button>)}</div></fieldset>}