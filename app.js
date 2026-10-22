(() => {
"use strict";
const root=document.getElementById("main");
const STATUS={draft:"Draft",consultation:"Consultation open",review:"Under review",ballot:"Awaiting formal ballot",approved:"Approved",not_approved:"Not approved"};
let policies=[],state,filters={q:"",domain:"",newOnly:false},adminTab="ballots";
const TODAY=Date.now();
const toISO=(d)=>new Date(d).toISOString();
const initial=()=>({submissions:[],votes:{},ballots:{},member:"Preview Member"});
function loadState(){try{const v=JSON.parse(sessionStorage.getItem("fusionpolicy-demo-v2")||"null");return v&&Array.isArray(v.submissions)&&v.ballots&&v.votes?v:initial()}catch{return initial()}}
function save(){sessionStorage.setItem("fusionpolicy-demo-v2",JSON.stringify(state))}
function escape(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function short(s,n=170){const t=String(s||"");return t.length>n?t.slice(0,n-1)+"…":t}
function niceDate(s){if(!s)return"Not scheduled";return new Date(s).toLocaleString("en-AU",{day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit",timeZone:"Australia/Sydney",timeZoneName:"short"})}
function inputDate(s){if(!s)return"";const d=new Date(s);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")+"T"+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")}
function badge(s){return '<span class="pill '+(s==="Open"?"mint":s==="New"?"new":s==="Closed"?"gray":"purple")+'">'+escape(s)+'</span>'}
function pageHead(eyebrow,title,desc){return '<div class="page-head"><span class="eyebrow">'+escape(eyebrow)+'</span><h1>'+escape(title)+'</h1><p>'+escape(desc||"")+'</p></div>'}
const url=id=>"#policy/"+encodeURIComponent(id);
const ballotUrl=id=>"#ballot/"+encodeURIComponent(id);
const contributeUrl=id=>"#contribute/"+encodeURIComponent(id);
const policyById=id=>policies.find(p=>p.id===id);
const domains=()=>[...new Set(policies.map(p=>p.domain))];
const newPolicies=()=>policies.filter(p=>p.isNew);
function domainCount(d){return policies.filter(p=>p.domain===d).length}
function policyStatus(p){return p.isNew?"Approval required":getBallot(p.id)?"Ballot scheduled":"In policy library"}
function timeStatus(b){if(!b)return"Not scheduled";const n=Date.now(),open=Date.parse(b.open),close=Date.parse(b.close);if(!Number.isFinite(open)||!Number.isFinite(close))return"Not scheduled";return n<open?"Scheduled":n>=close?"Closed":"Open"}
function getBallot(id){return state.ballots[id]}
function defaultDemoBallots(){
  if(Object.keys(state.ballots).length)return;
  const list=newPolicies().slice(0,3);
  list.forEach((p,i)=>{state.ballots[p.id]={open:toISO(TODAY-86400000),close:toISO(TODAY+(i+7)*86400000),threshold:50,quorum:0,demo:true}});
  save();
}
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("visible");clearTimeout(toast.timeout);toast.timeout=setTimeout(()=>el.classList.remove("visible"),4500)}
function setActive(route){document.querySelectorAll("[data-nav]").forEach(a=>a.classList.toggle("active",a.dataset.nav===(["policy","contribute"].includes(route)?"library":route==="ballot"?"ballots":route)));}
function home(){
 const groups=["RECLAIM OUR ECONOMY","RECLAIM OUR FUTURE"];
 let h='<section class="hero"><div><span class="eyebrow">MEMBER PARTICIPATION · DESIGN PREVIEW</span><h1>THE FUTURE OF POLICY IS PARTICIPATORY.</h1><p>Explore 76 proposals, share amendments and review formal approval ballots. Every policy has its own record and its own decision process.</p><div class="hero-actions"><a class="btn primary" href="#library">Explore policies →</a><a class="btn mint" href="#ballots">Review formal ballots →</a></div></div></section>';
 h+='<div class="stat-grid"><div class="stat"><strong>76</strong><span>Policy proposals</span></div><div class="stat"><strong>10</strong><span>Policy domains</span></div><div class="stat"><strong>23</strong><span>Marked for approval</span></div><div class="stat"><strong>'+state.submissions.length+'</strong><span>My demo submissions</span></div></div>';
 h+='<div class="info-strip"><strong>How it works:</strong> Read a policy → submit a comment or amendment → administrators consolidate a final draft → eligible members approve or do not approve during a formal voting window. This preview simulates these steps.</div>';
 groups.forEach((g,k)=>{h+='<div class="section-head"><div><span class="eyebrow">CATEGORY 0'+(k+1)+'</span><h2>'+escape(g)+'</h2><p>Browse the policy domains and their individual commitments.</p></div></div><div class="grid-three">';
 domains().filter(d=>policies.find(p=>p.domain===d)?.division===g).forEach((d,i)=>{h+='<a class="domain-card" href="#library?domain='+encodeURIComponent(d)+'"><span class="card-index">DOMAIN '+String(i+1).padStart(2,"0")+'</span><h3>'+escape(d)+'</h3><div class="card-meta">'+domainCount(d)+' policies <span class="arrow">↗</span></div></a>'});
 h+='</div>'});
 h+='<div class="callout"><span class="eyebrow">FORMAL APPROVAL</span><h2>WHEN A POLICY IS READY, MEMBERS DECIDE.</h2><p>The final wording is frozen for a scheduled ballot. Members can approve or do not approve; a reason is required for non-approval. Formal voting is not live in this demonstration.</p><a class="btn" href="#ballots">Explore ballot demonstration →</a></div>';
 return h;
}
function listTemplate(p){
 return '<a class="policy-item" href="'+url(p.id)+'"><div><div class="tags"><span class="pill gray">'+escape(p.id)+'</span>'+ (p.isNew?badge("New"):"")+'<span class="pill purple">'+escape(p.domain)+'</span></div><strong>'+escape(p.title)+'</strong><p>'+escape(short(p.statement,220))+'</p></div><span class="arrow">↗</span></a>';
}
function library(route){
 const query=route.split("?")[1]||"";const params=new URLSearchParams(query);
 if(params.has("domain"))filters.domain=params.get("domain")||"";
 let h=pageHead("01 / POLICY LIBRARY","Explore the policy programme","All 76 proposals imported from the supplied policy register, organised by division and domain.");
 h+='<div class="toolbar"><div class="field search"><label for="search">Search policies</label><input id="search" type="search" placeholder="Search title, commitment or policy domain" value="'+escape(filters.q)+'"></div><div class="field"><label for="domain-filter">Policy domain</label><select id="domain-filter"><option value="">All 10 domains</option>'+domains().map(d=>'<option value="'+escape(d)+'" '+(filters.domain===d?"selected":"")+'>'+escape(d)+'</option>').join("")+'</select></div><div class="field"><label for="new-filter">Policy type</label><select id="new-filter"><option value="all">All proposals</option><option value="new" '+(filters.newOnly?"selected":"")+'>New — approval required</option></select></div></div>';
 h+='<div id="policy-list"></div>';return h;
}
function drawList(){
 const holder=document.getElementById("policy-list");if(!holder)return;
 const q=filters.q.toLocaleLowerCase().trim();const found=policies.filter(p=>(!filters.domain||p.domain===filters.domain)&&(!filters.newOnly||p.isNew)&&(!q||[p.title,p.statement,p.domain,p.division,p.details].join(" ").toLocaleLowerCase().includes(q)));
 holder.innerHTML='<p class="note">'+found.length+' matching policies</p><div class="item-list">'+found.map(listTemplate).join("")+'</div>'+(found.length?"":'<div class="empty">No matching policies. Try another search.</div>');
}
function policyDetails(id){
 const p=policyById(id);if(!p)return notFound();
 let h='<nav class="breadcrumb" aria-label="Breadcrumb"><a href="#library">Policy library</a><span>/</span><span>'+escape(p.domain)+'</span><span>/</span><strong>'+escape(p.id)+'</strong></nav>';
 h+='<div class="detail-layout"><article class="detail"><div class="tags">'+(p.isNew?badge("New"):"")+'<span class="pill purple">'+escape(p.division)+'</span><span class="pill gray">'+escape(p.id)+'</span></div><h1>'+escape(p.title)+'</h1><p class="muted">'+escape(p.domain)+'</p><div class="panel accent"><span class="eyebrow">PROPOSED POLICY COMMITMENT</span><p class="statement">'+escape(p.statement)+'</p></div>';
 h+='<section class="panel soft"><h2>Intended outcomes</h2>'+(p.outcomes.length?'<ol class="outcomes">'+p.outcomes.map(x=>'<li>'+escape(x)+'</li>').join("")+'</ol>':'<p class="note">No numbered outcomes were included in the source.</p>')+'</section>';
 h+='<section class="panel soft"><details class="detail-summary"><summary>Supporting rationale, evidence, implementation and lineage — expand</summary><p class="note">Source material retained from the uploaded policy register. This is a consultation draft, not a certification of evidence.</p><div class="long-copy">'+escape(p.details||"No further detail supplied.")+'</div></details></section></article>';
 h+='<aside class="aside-sticky"><div class="panel"><span class="eyebrow">PARTICIPATE</span><h3>Help refine this proposal</h3><p class="note">Offer feedback, suggest exact replacement wording or submit a new direction.</p><a class="btn primary" href="'+contributeUrl(id)+'">Contribute to this policy →</a>'+((p.isNew||getBallot(p.id))?'<a class="btn mint" href="'+ballotUrl(id)+'">View formal ballot →</a>':'')+'<hr><h3>Record</h3><p class="note">Version: source draft 1.0<br>Status: '+escape(policyStatus(p))+'<br>Formal approval: '+(p.isNew?"Required":"Not specified in source")+'</p></div><div class="info-strip">Only administrators can consolidate the final wording. During a formal ballot, the policy text is locked.</div></aside></div>';
 return h;
}
function contribute(id){
 const p=policyById(id);if(!p)return notFound();
 let h='<nav class="breadcrumb"><a href="'+url(id)+'">← Back to policy</a></nav>'+pageHead("02 / CONSULTATION","Make a contribution",p.title);
 h+='<div class="grid-two"><section class="panel"><h3>Current policy commitment</h3><p class="note">'+escape(p.statement)+'</p><span class="pill gray">'+escape(p.id)+'</span></section><section class="panel"><form id="contribution-form" data-policy="'+escape(id)+'"><div class="field"><label for="contribution-type">Contribution type</label><select id="contribution-type" name="type" required><option value="comment">Comment or feedback</option><option value="amendment">Proposed wording amendment</option><option value="new">New or alternative policy direction</option></select></div><div class="field" style="margin-top:15px"><label for="contribution-body">Your contribution</label><textarea name="body" id="contribution-body" minlength="10" required placeholder="Explain your suggestion in your own words."></textarea></div><div class="field" style="margin-top:15px"><label for="contribution-why">Reason or supporting explanation (optional)</label><textarea name="why" id="contribution-why" placeholder="Explain the problem or reasoning behind your proposal."></textarea></div><div class="warning-strip" style="margin-top:17px">Demonstration only. The preview does not transmit or securely store contributions. Do not enter sensitive or personal information.</div><div class="form-actions"><button class="btn primary" type="submit">Record demo contribution</button><a class="btn ghost" href="'+url(id)+'">Cancel</a></div></form></section></div>';
 return h;
}
function ballotListing(){
 let h=pageHead("03 / FORMAL APPROVAL","Formal policy ballots","The 23 policies marked as new in the source register are listed for approval. Demo schedules are illustrative and can be adjusted from the administration screen.");
 h+='<div class="info-strip"><strong>Rule:</strong> One counted selection per eligible member per policy. “Do Not Approve” requires a written reason. A final ballot would use server-verified membership and deadlines.</div><div class="section-head"><h2>Approval queue</h2></div><div class="ballot-list">';
 for(const p of policies.filter(p=>p.isNew||getBallot(p.id))){
 const b=getBallot(p.id),status=timeStatus(b),v=state.votes[p.id];
 h+='<div class="ballot-row"><div><div class="tags"><span class="pill gray">'+escape(p.id)+'</span>'+badge(status)+(v?badge("Demo vote recorded"):"")+'</div><h3>'+escape(p.title)+'</h3><p>'+escape(p.domain)+' · '+(b?"Closes "+niceDate(b.close):"Awaiting administrator scheduling")+'</p></div><a class="btn '+(status==="Open"?"primary":"ghost")+' small" href="'+ballotUrl(p.id)+'">'+(status==="Open"?"Review ballot →":"View details →")+'</a></div>';
 }
 return h+'</div>';
}
function ballotPage(id){
 const p=policyById(id);if(!p||(!p.isNew&&!getBallot(id)))return notFound();
 const b=getBallot(id),status=timeStatus(b),v=state.votes[id];
 let h='<nav class="breadcrumb"><a href="#ballots">← Formal ballots</a><span>/</span><strong>'+escape(p.id)+'</strong></nav>';
 h+=pageHead("FORMAL POLICY APPROVAL",p.title,"Vote on the exact policy statement below. The supporting material can be reviewed in the policy library.");
 h+='<div class="detail-layout"><section><div class="panel accent"><div class="tags">'+badge(status)+'<span class="pill gray">DEMO · POLICY VERSION 1.0</span></div><h3 style="margin-top:17px">Text presented for approval</h3><p class="statement">'+escape(p.statement)+'</p><a href="'+url(id)+'">Read supporting rationale and outcomes →</a></div>';
 if(status==="Open"){
 h+='<form id="vote-form" data-policy="'+escape(id)+'" class="panel"><h2>Cast your demonstration ballot</h2><p class="note">Do you approve this exact wording as formal party policy?</p><div class="options"><label class="choice"><input name="choice" type="radio" value="approve" '+(!v||v.choice==="approve"?"checked":"")+' required><span><strong>Approve</strong><small>I approve this wording as formal party policy.</small></span></label><label class="choice"><input name="choice" type="radio" value="reject" '+(v?.choice==="reject"?"checked":"")+' required><span><strong>Do Not Approve</strong><small>I do not approve this wording and will provide a reason.</small></span></label></div>';
 h+='<div id="reason-wrap" class="field" style="margin-top:16px" '+(v?.choice==="reject"?"":"hidden")+'><label for="vote-reason">Reason for non-approval (required)</label><textarea name="reason" id="vote-reason" minlength="10" placeholder="Explain your objection and, if possible, the change you recommend.">'+escape(v?.reason||"")+'</textarea></div><div class="form-actions"><button type="submit" class="btn primary">'+(v?"Update my demo ballot":"Review my demo ballot")+' →</button></div><div id="vote-confirm"></div></form>';
 } else h+='<div class="panel"><h3>'+escape(status==="Scheduled"?"This ballot has not opened":status==="Closed"?"The demonstration ballot has closed":"This policy has not been scheduled")+'</h3><p class="note">Participation becomes available only inside the configured ballot window.</p><a class="btn ghost" href="#ballots">Back to all ballots</a></div>';
 h+='</section><aside class="aside-sticky"><div class="panel"><span class="eyebrow">BALLOT WINDOW</span><div class="meta-grid"><div><small>Opens</small><strong>'+escape(niceDate(b?.open))+'</strong></div><div><small>Closes</small><strong>'+escape(niceDate(b?.close))+'</strong></div></div><hr><h3>Ballot safeguards</h3><p class="note">Policy version cannot change once open. One active selection per member. A reason is mandatory for non-approval. Changes before closing supersede the previous selection.</p>'+(v?'<div class="success-strip"><strong>Demonstration selection saved in this browser tab.</strong><br>Receipt '+escape(v.receipt)+'<br>'+escape(v.choice==="approve"?"Approve":"Do Not Approve")+'</div>':'')+'</div></aside></div>';
 return h;
}
function activity(){
 let h=pageHead("04 / MY PARTICIPATION","My activity","Demonstration entries exist only in the current browser tab. No account is logged in.");
 h+='<div class="stat-grid"><div class="stat"><strong>'+state.submissions.length+'</strong><span>My submissions</span></div><div class="stat"><strong>'+Object.keys(state.votes).length+'</strong><span>Demo ballots</span></div><div class="stat"><strong>'+state.submissions.filter(s=>s.status==="Reviewed").length+'</strong><span>Reviewed submissions</span></div><div class="stat"><strong>'+newPolicies().length+'</strong><span>Approval queue</span></div></div>';
 h+='<div class="section-head"><h2>My consultation submissions</h2><a class="btn small" href="#library">Browse policies →</a></div>';
 if(!state.submissions.length)h+='<div class="empty">No contributions yet. Choose a policy and submit an example amendment or comment.</div>';
 else h+='<div class="stack">'+state.submissions.slice().reverse().map(s=>'<article class="activity-card"><span class="pill purple">'+escape(s.type)+'</span> <span class="pill gray">'+escape(s.status)+'</span><h3>'+escape(policyById(s.policy)?.title||"Policy")+'</h3><p>'+escape(s.body)+'</p><small>Receipt '+escape(s.id)+' · '+escape(niceDate(s.at))+'</small></article>').join("")+'</div>';
 h+='<div class="section-head"><h2>My demonstration ballot receipts</h2></div>';
 const votes=Object.entries(state.votes);
 if(!votes.length)h+='<div class="empty">No demonstration ballots recorded. Review an open example ballot.</div>';
 else h+='<div class="stack">'+votes.map(([id,v])=>'<article class="activity-card"><span class="pill mint">'+escape(v.choice==="approve"?"Approve":"Do Not Approve")+'</span><h3>'+escape(policyById(id)?.title||id)+'</h3><p>Receipt: <span class="mono">'+escape(v.receipt)+'</span></p><small>Recorded '+escape(niceDate(v.at))+' · Only the latest selection counts in this preview.</small></article>').join("")+'</div>';
 return h;
}
function admin(){
 let h=pageHead("ADMINISTRATOR PREVIEW","Consultation management","Demonstration controls for ballot scheduling and submission review. There is no login or production authority in this static preview.");
 h+='<div class="warning-strip"><strong>Not secure administration.</strong> These controls run entirely in this browser and cannot change real party policy, members or voting records. Production deployment requires an authenticated backend with role-based permissions.</div>';
 h+='<div class="admin-tabs"><button class="tab '+(adminTab==="ballots"?"active":"")+'" data-admin-tab="ballots">Ballot scheduling</button><button class="tab '+(adminTab==="submissions"?"active":"")+'" data-admin-tab="submissions">Submission review</button><button class="tab '+(adminTab==="results"?"active":"")+'" data-admin-tab="results">Results preview</button><button class="tab '+(adminTab==="rules"?"active":"")+'" data-admin-tab="rules">Production controls</button></div>';
 if(adminTab==="ballots")h+=adminBallots();
 if(adminTab==="submissions")h+=adminSubmissions();
 if(adminTab==="results")h+=adminResults();
 if(adminTab==="rules")h+=adminRules();
 return h;
}
function adminBallots(){
 let h='<div class="grid-two"><section class="panel"><h2>Set approval window</h2><form id="schedule-form"><div class="field"><label for="schedule-policy">Policy</label><select id="schedule-policy" name="policy">'+policies.map(p=>'<option value="'+escape(p.id)+'">'+escape(p.title)+'</option>').join("")+'</select></div><div class="field" style="margin-top:13px"><label for="opens-at">Opens (browser-local input)</label><input type="datetime-local" id="opens-at" name="open" required></div><div class="field" style="margin-top:13px"><label for="closes-at">Closes (browser-local input)</label><input type="datetime-local" id="closes-at" name="close" required></div><div class="grid-two" style="margin-top:13px"><div class="field"><label for="threshold">Approval threshold (%)</label><input type="number" id="threshold" name="threshold" min="1" max="100" value="50" required></div><div class="field"><label for="quorum">Turnout quorum (%)</label><input type="number" id="quorum" name="quorum" min="0" max="100" value="0" required></div></div><p class="note">Thresholds in this preview are illustrative, not party rules. Scheduled times are converted to UTC for record storage.</p><button class="btn primary" type="submit">Save demonstration schedule →</button></form></section>';
 h+='<section class="panel"><h2>Policy approval queue</h2><p>23 proposals were flagged as new in the uploaded source file. Each can receive an independent approval window.</p><div class="stat-grid" style="grid-template-columns:repeat(2,1fr)"><div class="stat"><strong>'+newPolicies().filter(p=>timeStatus(getBallot(p.id))==="Open").length+'</strong><span>Open demo windows</span></div><div class="stat"><strong>'+newPolicies().filter(p=>!getBallot(p.id)).length+'</strong><span>Awaiting scheduling</span></div></div><div class="info-strip">Production safeguards: freeze policy version and eligible voter roll at opening; server-enforced time checks; audit log; appointed certifier; no edits to recorded votes.</div></section></div>';
 h+='<div class="section-head"><h2>Scheduled policies</h2></div><div class="table-wrap"><table><thead><tr><th>Policy</th><th>Status</th><th>Closing time</th><th>Action</th></tr></thead><tbody>'+policies.filter(p=>p.isNew||getBallot(p.id)).map(p=>{const b=getBallot(p.id);return '<tr><td><strong>'+escape(p.title)+'</strong></td><td>'+badge(timeStatus(b))+'</td><td>'+escape(b?niceDate(b.close):"—")+'</td><td><button class="btn small ghost" data-edit-schedule="'+escape(p.id)+'">Configure</button></td></tr>'}).join("")+'</tbody></table></div>';return h;
}
function adminSubmissions(){
 return '<div class="section-head"><h2>Review consultation submissions</h2></div>'+(state.submissions.length?'<div class="stack">'+state.submissions.slice().reverse().map(s=>'<div class="panel soft"><div class="tags"><span class="pill purple">'+escape(s.type)+'</span><span class="pill gray">'+escape(s.status)+'</span></div><h3 style="margin-top:12px">'+escape(policyById(s.policy)?.title||s.policy)+'</h3><p>'+escape(s.body)+'</p>'+(s.why?'<p class="note">Reason: '+escape(s.why)+'</p>':'')+'<button class="btn small" data-mark-reviewed="'+escape(s.id)+'">'+(s.status==="Reviewed"?"Mark pending":"Mark reviewed")+'</button></div>').join("")+'</div>':'<div class="empty">No example contributions yet. Submit one from a policy page, then return here.</div>');
}
function adminResults(){
 const votes=Object.entries(state.votes);let h='<div class="info-strip">These figures are limited to a single browser-session demo identity. They cannot establish quorum, eligibility, real approval or certification. No formal policy is approved here.</div>';
 h+='<div class="section-head"><h2>Demonstration tallies</h2></div><div class="table-wrap"><table><thead><tr><th>Policy</th><th>Approve</th><th>Do not approve</th><th>Certification</th></tr></thead><tbody>';
 for(const p of policies){const v=state.votes[p.id];if(!v)continue;h+='<tr><td>'+escape(p.title)+'</td><td>'+(v.choice==="approve"?1:0)+'</td><td>'+(v.choice==="reject"?1:0)+'</td><td>Not available in demo</td></tr>'}
 h+='</tbody></table></div>';if(!votes.length)h+='<div class="empty">No demo votes recorded yet.</div>';return h;
}
function adminRules(){
 return '<div class="grid-two"><div class="panel"><h2>Governance rules</h2><p>Before a genuine ballot, the party must confirm eligibility, voter-roll freeze, vote secrecy, quorum, approval threshold, deadline and timezone rules, whether changes are allowed, and the lawful officer who certifies outcomes.</p><p class="note">The defaults are not a representation of the party constitution.</p></div><div class="panel"><h2>Future backend</h2><p>Integrate a separate membership database and server-side API. Enforce one active vote per member and policy ballot in the database; store mandatory dissent reasons with appropriate access restrictions; track amendments and immutable policy versions.</p><p class="note">Never store private member data, API keys or live ballots in GitHub Pages.</p></div></div>';
}
function notFound(){return pageHead("NOT FOUND","That page could not be found","Return to the policy library to continue.")+'<a class="btn primary" href="#library">Policy library →</a>'}
function route(){
 const routeRaw=decodeURIComponent((location.hash||"#home").slice(1));const [main,arg]=routeRaw.split("/");const view=main.split("?")[0];
 root.innerHTML=view==="home"||!view?home():view==="library"?library(routeRaw):view==="policy"?policyDetails(arg):view==="contribute"?contribute(arg):view==="ballots"?ballotListing():view==="ballot"?ballotPage(arg):view==="participation"?activity():view==="admin"?admin():notFound();
 setActive(view);
 if(view==="library"){drawList();document.getElementById("search")?.addEventListener("input",e=>{filters.q=e.target.value;drawList()});document.getElementById("domain-filter")?.addEventListener("change",e=>{filters.domain=e.target.value;drawList()});document.getElementById("new-filter")?.addEventListener("change",e=>{filters.newOnly=e.target.value==="new";drawList()})}
 if(view==="admin"&&adminTab==="ballots")loadScheduleInputs();
 window.scrollTo({top:0,behavior:"instant"});
}
function loadScheduleInputs(){
 const el=document.getElementById("schedule-policy");if(!el)return;
 const b=getBallot(el.value);
 const open=b?.open||toISO(Date.now()+3600000),close=b?.close||toISO(Date.now()+8*86400000);
 document.getElementById("opens-at").value=inputDate(open);
 document.getElementById("closes-at").value=inputDate(close);
 document.getElementById("threshold").value=b?.threshold??50;
 document.getElementById("quorum").value=b?.quorum??0;
}
document.addEventListener("submit",ev=>{
 const form=ev.target;
 if(form.id==="contribution-form"){
  ev.preventDefault();const f=new FormData(form),body=String(f.get("body")||"").trim();
  if(body.length<10){toast("Please add a substantive contribution.");return}
  const item={id:"DEMO-S"+String(state.submissions.length+1).padStart(4,"0"),policy:form.dataset.policy,type:String(f.get("type")),body,why:String(f.get("why")||"").trim(),at:toISO(Date.now()),status:"Pending"};
  state.submissions.push(item);save();location.hash="#participation";toast("Demonstration submission recorded in this tab.");return;
 }
 if(form.id==="schedule-form"){
  ev.preventDefault();const f=new FormData(form),id=String(f.get("policy")),start=new Date(String(f.get("open"))),end=new Date(String(f.get("close"))),threshold=Number(f.get("threshold")),quorum=Number(f.get("quorum"));
  if(!id||!Number.isFinite(+start)||!Number.isFinite(+end)||end<=start){toast("Choose a valid opening and later closing time.");return}
  if(threshold<1||threshold>100||quorum<0||quorum>100){toast("Check the threshold and quorum percentages.");return}
  const old=getBallot(id);if(old&&timeStatus(old)==="Closed"){toast("Closed ballots cannot be reopened; create a new production ballot instead.");return}
  if(old&&timeStatus(old)==="Open"&&Object.prototype.hasOwnProperty.call(state.votes,id)){toast("Cannot change the window of a demo ballot after a vote exists.");return}
  state.ballots[id]={open:start.toISOString(),close:end.toISOString(),threshold,quorum,demo:true};save();route();toast("Demonstration ballot schedule saved.");return;
 }
 if(form.id==="vote-form"){
  ev.preventDefault();const p=policyById(form.dataset.policy),b=getBallot(form.dataset.policy);
  if(!p||timeStatus(b)!=="Open"){toast("This ballot is not currently open.");route();return}
  const f=new FormData(form),choice=String(f.get("choice")||""),reason=String(f.get("reason")||"").trim();
  if(choice!=="approve"&&choice!=="reject"){toast("Select Approve or Do Not Approve.");return}
  if(choice==="reject"&&reason.length<10){toast("Please provide a reason for non-approval (at least 10 characters).");return}
  const confirmDiv=document.getElementById("vote-confirm");
  confirmDiv.innerHTML='<div class="panel soft" style="margin-top:18px"><h3>Confirm demonstration ballot</h3><p>Your selection: <strong>'+escape(choice==="approve"?"Approve":"Do Not Approve")+'</strong></p>'+(choice==="reject"?'<p class="note">Reason: '+escape(reason)+'</p>':'')+'<p class="note">This action only saves an example locally in this browser tab.</p><button type="button" class="btn mint" id="confirm-demo-vote">Confirm demo selection</button></div>';
  document.getElementById("confirm-demo-vote").addEventListener("click",()=>{
   if(timeStatus(getBallot(p.id))!=="Open"){toast("Voting window has closed.");route();return}
   const prev=state.votes[p.id];
   state.votes[p.id]={choice,reason:choice==="reject"?reason:"",at:toISO(Date.now()),receipt:prev?.receipt||("DEMO-V"+Math.random().toString(36).slice(2,10).toUpperCase()),changes:(prev?.changes||0)+(prev?1:0)};
   save();route();toast("Demonstration vote recorded. No real ballot was cast.");
  });return;
 }
});
document.addEventListener("change",ev=>{
 if(ev.target.matches('input[name="choice"]')){
  const w=document.getElementById("reason-wrap");if(!w)return;
  w.hidden=ev.target.value!=="reject";
  document.getElementById("vote-reason").required=ev.target.value==="reject";
  const c=document.getElementById("vote-confirm");if(c)c.innerHTML="";
 }
 if(ev.target.id==="schedule-policy")loadScheduleInputs();
});
document.addEventListener("click",ev=>{
 const tab=ev.target.closest("[data-admin-tab]");if(tab){adminTab=tab.dataset.adminTab;route();return}
 const edit=ev.target.closest("[data-edit-schedule]");if(edit){const el=document.getElementById("schedule-policy");el.value=edit.dataset.editSchedule;loadScheduleInputs();el.focus();window.scrollTo({top:0,behavior:"smooth"});return}
 const mark=ev.target.closest("[data-mark-reviewed]");if(mark){const s=state.submissions.find(x=>x.id===mark.dataset.markReviewed);if(s){s.status=s.status==="Reviewed"?"Pending":"Reviewed";save();route();toast("Demo review status updated.")}return}
});
document.getElementById("menu-toggle").addEventListener("click",function(){const n=document.getElementById("mobile-nav");n.hidden=!n.hidden;this.setAttribute("aria-expanded",String(!n.hidden))});
document.getElementById("mobile-nav").addEventListener("click",ev=>{if(ev.target.closest("a")){document.getElementById("mobile-nav").hidden=true;document.getElementById("menu-toggle").setAttribute("aria-expanded","false")}});
document.getElementById("reset-demo").addEventListener("click",()=>{if(!confirm("Reset all simulated submissions, votes and schedules in this browser tab?"))return;sessionStorage.removeItem("fusionpolicy-demo-v2");state=initial();defaultDemoBallots();route();toast("Preview reset.")});
window.addEventListener("hashchange",()=>{filters={q:"",domain:"",newOnly:false};route()});
fetch("./policies.json").then(r=>{if(!r.ok)throw Error("Policy data unavailable");return r.json()}).then(data=>{
 policies=data.policies||[];if(policies.length!==76)throw Error("Expected 76 policies but found "+policies.length);
 state=loadState();defaultDemoBallots();route();
}).catch(err=>{root.innerHTML='<div class="panel"><h2>Could not load policies</h2><p>'+escape(err.message)+'</p><p>Check that index.html, app.js and policies.json are published together.</p></div>'});
})();