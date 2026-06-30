import { useState, useRef, useEffect } from "react";

// --- Design Tokens -- Sage Green . Burnt Sienna . Golden Beige . Warm White ---
const C = {
  // Page grounds -- Warm White as primary, Golden Beige for depth
  base:      "#F2EDDE",   // Warm White -- primary page background
  shell:     "#3D1E0A",   // deep warm brown -- headers, nav, tab bar (rich leather)
  surface:   "#EBE4CE",   // slightly deeper warm white for card surfaces
  lift:      "#CFB586",   // Golden Beige -- elevated surfaces, selected rows
  // Borders -- Golden Beige spectrum
  border:    "#CFB586",   // Golden Beige -- standard divider
  borderLt:  "#B89E6A",   // deeper Golden Beige for card interiors
  // Text -- dark brown, readable on warm white
  sand:      "#2A1206",   // near-black warm brown -- primary text
  canvas:    "#5A3420",   // secondary text -- rich mid-brown
  dust:      "#9C9F88",   // Sage Green -- muted labels, icons, placeholders
  // Accents -- Burnt Sienna as primary action colour
  olive:     "#A4623E",   // Burnt Sienna -- buttons, active states, highlights
  oliveLt:   "#C07848",   // lighter Burnt Sienna -- hover, secondary accent
  olivePale: "#A4623E14", // pale Burnt Sienna wash -- selected row tint
  khaki:     "#A4623E",   // Burnt Sienna -- data / numbers
  // Status
  green:     "#5A7A3A",   // muted sage-toned green for positive status
  red:       "#8A2E1A",   // deep red for negative / danger
  redLt:     "#8A2E1A14",
};

const FD = "'Playfair Display', serif";
const FB = "'Inter', sans-serif";

// --- SVG Icon Library ---------------------------------------------------------
const Icon = ({ name, size = 18, color = "currentColor", sw = 1.5 }) => {
  const d = {
    home:      <><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></>,
    photo:     <><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></>,
    wallet:    <><rect x="2" y="7" width="20" height="14" rx="2"/><circle cx="16" cy="14" r="1" fill="currentColor" stroke="none"/><path d="M2 11h20"/></>,
    music:     <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,
    chat:      <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
    calendar:  <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    tent:      <><path d="M12 2L2 20h20L12 2z"/><path d="M12 14v6M9 20h6"/></>,
    plus:      <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    check:     <><polyline points="20 6 9 17 4 12"/></>,
    back:      <><polyline points="15 18 9 12 15 6"/></>,
    edit:      <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    user:      <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    users:     <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
    chevR:     <><polyline points="9 18 15 12 9 6"/></>,
    send:      <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    location:  <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>,
    key:       <><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></>,
    fire:      <><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/></>,
    link:      <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></>,
    chef:      <><path d="M6 13.87A4 4 0 017.41 6a5.11 5.11 0 019.18 0A4 4 0 0118 13.87V21H6v-7.13z"/><line x1="6" y1="17" x2="18" y2="17"/></>,
    cup:       <><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>,
    utensils:  <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></>,
    moon:      <><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></>,
    heart:     <><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></>,
    share:     <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
    download:  <><path d="M12 3v12"/><polyline points="7 10 12 15 17 10"/><path d="M5 21h14"/></>,
    wind:      <><path d="M9.59 4.59A2 2 0 1111 8H2"/><path d="M12.59 11.59A2 2 0 1114 15H2"/><path d="M16.59 16.59A2 2 0 1118 20H2"/></>,
    sunrise:   <><path d="M17 18a5 5 0 00-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="1" y1="18" x2="23" y2="18"/><line x1="8" y1="22" x2="16" y2="22"/></>,
    sunset:    <><path d="M17 18a5 5 0 00-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="1" y1="18" x2="23" y2="18"/><line x1="8" y1="22" x2="16" y2="22"/></>,
    pin:       <><path d="M12 22s8-7.5 8-13a8 8 0 10-16 0c0 5.5 8 13 8 13z"/><circle cx="12" cy="9" r="2.5"/></>,
    mic:       <><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>,
    upvote:    <><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></>,
    copy:      <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>,
    trash:     <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></>,
    info:      <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    play:      <><polygon points="5 3 19 12 5 21 5 3"/></>,
    skip:      <><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></>,
    prev:      <><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></>,
    star:      <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
    scope:     <><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="3" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="21" y2="12"/><circle cx="12" cy="12" r="2.5"/></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{width:size,height:size,display:"block",flexShrink:0}}>
      {d[name]}
    </svg>
  );
};

// --- Utilities ----------------------------------------------------------------
const fl = (dir="row",al="center",ju="flex-start",gap=0) => ({display:"flex",flexDirection:dir,alignItems:al,justifyContent:ju,gap});

function useToast() {
  const [t,setT] = useState(null);
  const show = (msg,dur=2000) => { setT(msg); setTimeout(()=>setT(null),dur); };
  return [t,show];
}
function Toast({msg}) {
  if (!msg) return null;
  return (
    <div style={{
      position:"fixed",bottom:82,left:"50%",transform:"translateX(-50%)",
      background:C.shell,color:C.sand,padding:"9px 20px",borderRadius:2,
      fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
      boxShadow:`0 4px 20px ${C.base}AA`,zIndex:9999,whiteSpace:"nowrap",
      border:`1px solid ${C.border}`,
    }}>{msg}</div>
  );
}

function Btn({children,variant="primary",onClick,full,small,disabled,style={}}) {
  const base = {
    border:"none",borderRadius:2,cursor:disabled?"not-allowed":"pointer",
    fontFamily:FB,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
    padding:small?"6px 14px":"10px 22px",fontSize:small?10:11,
    width:full?"100%":"auto",opacity:disabled?0.4:1,
  };
  const v = {
    primary: {background:C.olive,color:"#F2EDDE"},
    ghost:   {background:"transparent",color:C.canvas,border:`1px solid ${C.borderLt}`},
    danger:  {background:"transparent",color:C.red,border:`1px solid ${C.red}88`},
    surface: {background:C.surface,color:C.canvas,border:`1px solid ${C.borderLt}`},
    lift:    {background:C.lift,color:C.sand,border:`1px solid ${C.border}`},
  };
  return <button style={{...base,...(v[variant]||v.primary),...style}} onClick={!disabled?onClick:undefined}>{children}</button>;
}

function InitialAvatar({name, size=36, accent=false, photo=null}) {
  const ini = (name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  if (photo) return (
    <div style={{
      width:size,height:size,borderRadius:"50%",flexShrink:0,
      overflow:"hidden",
      border:`1.5px solid ${accent?"#A4623E":C.borderLt}`,
    }}>
      <img src={photo} alt={name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
    </div>
  );
  return (
    <div style={{
      width:size,height:size,borderRadius:"50%",flexShrink:0,
      background:accent?"#3D1E0A":C.lift,
      border:`1.5px solid ${accent?"#7A3820":C.borderLt}`,
      ...fl("row","center","center"),
      fontFamily:FD,fontSize:Math.round(size*0.33),
      color:accent?"#F2EDDE":C.canvas,fontWeight:700,letterSpacing:"0.02em",
    }}>{ini}</div>
  );
}

function SectionLabel({children,style={}}) {
  return <div style={{fontSize:9,fontWeight:700,color:C.dust,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:8,...style}}>{children}</div>;
}

function Rule({color=C.border}) {
  return <div style={{height:1,background:color}}/>;
}

function Card({children,style={}}) {
  return <div style={{background:C.surface,border:`1px solid ${C.borderLt}`,borderRadius:3,overflow:"hidden",...style}}>{children}</div>;
}

// =============================================================================
//  WEATHER WIDGET
// =============================================================================
function WeatherWidget({location}) {
  // Mock data -- in production this would call a weather API keyed to camp GPS coords
  const today = {temp:24,condition:"Clear",wind:14,windDir:"NE",sunrise:"06:42",sunset:"17:58"};

  const SunIcon = ({size=14,color}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="4.2" y1="4.2" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.8" y2="19.8"/>
      <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
      <line x1="4.2" y1="19.8" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.8" y2="4.2"/>
    </svg>
  );

  return (
    <div style={{marginBottom:14}}>
      <Card style={{padding:"9px 12px",background:C.shell,border:"none"}}>
        <div style={{...fl("row","center","space-between")}}>
          <div style={{...fl("row","center","flex-start",8)}}>
            <SunIcon size={20} color="#CFB586"/>
            <div>
              <div style={{...fl("row","center","flex-start",6)}}>
                <span style={{fontFamily:FD,fontSize:17,fontWeight:700,color:"#F2EDDE",lineHeight:1}}>{today.temp}&deg;</span>
                <span style={{fontSize:10,color:"#9C9F88"}}>{today.condition}</span>
              </div>
              <div style={{fontSize:8.5,color:"#9C9F88",marginTop:1}}>{location}</div>
            </div>
          </div>
          <div style={{...fl("row","center","flex-end",10)}}>
            <div style={{...fl("row","center","flex-start",3)}}>
              <Icon name="wind" size={10} color="#9C9F88"/>
              <span style={{fontSize:9.5,color:"#CFB586",fontWeight:600}}>{today.wind}km/h {today.windDir}</span>
            </div>
            <div style={{width:1,height:12,background:"#5A2E14"}}/>
            <div style={{...fl("row","center","flex-start",3)}}>
              <Icon name="sunrise" size={10} color="#9C9F88"/>
              <span style={{fontSize:9.5,color:"#CFB586",fontWeight:600}}>{today.sunrise}</span>
            </div>
            <div style={{...fl("row","center","flex-start",3)}}>
              <Icon name="sunset" size={10} color="#9C9F88"/>
              <span style={{fontSize:9.5,color:"#CFB586",fontWeight:600}}>{today.sunset}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function BackBar({label,onBack}) {
  return (
    <div style={{
      background:C.shell,padding:"12px 16px",
      borderBottom:`1px solid #5A2E14`,
      position:"sticky",top:0,zIndex:50,...fl("row","center","flex-start",10),
    }}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#F2EDDE",cursor:"pointer",padding:2,...fl()}}>
        <Icon name="back" size={20} color="#F2EDDE"/>
      </button>
      <span style={{fontFamily:FD,fontSize:16,color:"#F2EDDE",fontWeight:700,letterSpacing:"0.01em"}}>{label}</span>
    </div>
  );
}

const inp = {
  width:"100%",boxSizing:"border-box",padding:"10px 12px",
  background:C.surface,border:`1px solid ${C.borderLt}`,
  borderRadius:2,color:C.sand,fontFamily:FB,fontSize:13,outline:"none",lineHeight:1.4,
};

// --- Data ---------------------------------------------------------------------
const CONTACTS = [
  {id:2,name:"Kobus van Rensburg",role:"Member"},
  {id:3,name:"Willem Kruger",     role:"Member"},
  {id:4,name:"Ingrid Botha",      role:"Member"},
  {id:5,name:"Riaan Smit",        role:"Member"},
  {id:6,name:"Danie Joubert",     role:"Member"},
  {id:7,name:"Andre Meiring",     role:"PH / Guide"},
];

const INIT_EXPENSES = [];

const INIT_PHOTOS = [];

const INIT_MESSAGES = [];

function getTripDays(from,to){
  const days=[],start=new Date(from),end=new Date(to);
  const DN=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const MN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1))
    days.push({key:d.toISOString().split("T")[0],dn:DN[d.getDay()],num:d.getDate(),mn:MN[d.getMonth()]});
  return days;
}

const MEAL_SLOTS = [
  {id:"breakfast",label:"Breakfast",icon:"cup"},
  {id:"lunch",    label:"Lunch",    icon:"utensils"},
  {id:"dinner",   label:"Dinner",   icon:"moon"},
];


// =============================================================================
//  LOGIN
// =============================================================================
function LoginScreen({onLogin}) {
  const [tab,setTab]       = useState("signin");
  const [email,setEmail]   = useState("wihan@huntbuddy.app");
  const [pass,setPass]     = useState("");
  const [name,setName]     = useState("");
  const [avatar,setAvatar] = useState(null);
  const [popia,setPopia]   = useState(false);
  const [showPopia,setShowPopia] = useState(false);
  const [addBanking,setAddBanking] = useState(false);
  const [bankHolder,setBankHolder] = useState("");
  const [bankName,setBankName]     = useState("");
  const [bankAcc,setBankAcc]       = useState("");
  const [bankType,setBankType]     = useState("Cheque");
  const avatarRef = useRef(null);

  const handleAvatar = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const canSubmit = tab==="signin" || (popia && name && email && pass);

  if (showPopia) return (
    <div style={{minHeight:"100vh",background:C.base,...fl("column","stretch","flex-start")}}>
      <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,...fl("row","center","flex-start",10)}}>
        <button onClick={()=>setShowPopia(false)} style={{background:"none",border:"none",cursor:"pointer",padding:0,...fl()}}>
          <Icon name="back" size={20} color={C.canvas}/>
        </button>
        <span style={{fontFamily:FD,fontSize:16,color:C.sand,fontWeight:700}}>Data Privacy Notice</span>
      </div>
      <div style={{padding:"20px 20px",flex:1,overflowY:"auto"}}>
        <div style={{fontSize:9,color:C.dust,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:6}}>
          POPIA -- Protection of Personal Information Act 4 of 2013
        </div>
        <div style={{fontFamily:FD,fontSize:18,color:C.sand,fontWeight:700,marginBottom:16,lineHeight:1.3}}>
          How we collect, use and protect your information
        </div>
        {[
          {h:"Who we are",body:"HuntBuddy is operated by Brightleaf Trading (Pty) Ltd, registered in the Republic of South Africa. We act as the Responsible Party under POPIA for all personal information processed through this application."},
          {h:"What information we collect",body:"We collect your name, email address, profile photograph (optional), device identifiers, and content you create within the app including photographs, captions, meal plans, and financial data shared within camp groups."},
          {h:"Why we collect it",body:"Your information is used solely to operate your HuntBuddy account and facilitate camp group functionality, including photo sharing between camp members. We do not sell or trade your personal information to third parties."},
          {h:"Your rights under POPIA",body:"You have the right to access the personal information we hold about you, to request correction of inaccurate information, to object to processing, and to request deletion of your account and associated data at any time. Contact privacy@huntbuddy.app."},
          {h:"Data retention",body:"Account data is retained for the duration of your active account. Upon deletion, your personal information is permanently removed within 30 days. Camp data shared with other members may be retained by those members in their own records."},
          {h:"Security",body:"We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, disclosure, alteration, or destruction. All data is transmitted over encrypted connections."},
          {h:"Contact the Information Officer",body:"For privacy queries or complaints: privacy@huntbuddy.app. You also have the right to lodge a complaint with the Information Regulator (South Africa) at inforeg@justice.gov.za."},
        ].map((s,i)=>(
          <div key={i} style={{marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:C.olive,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{s.h}</div>
            <p style={{fontSize:12,color:C.canvas,lineHeight:1.75,margin:0}}>{s.body}</p>
          </div>
        ))}
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14,marginTop:4}}>
          <p style={{fontSize:11,color:C.dust,lineHeight:1.65,margin:"0 0 14px"}}>
            Last updated June 2025. By registering you confirm you have read and understood this notice and consent to the processing of your personal information as described above.
          </p>
          <Btn variant="primary" full onClick={()=>{setPopia(true);setShowPopia(false);}} style={{padding:"12px"}}>
            I Understand and Accept
          </Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.base,...fl("column","stretch","flex-start")}}>
      <div style={{
        padding:"52px 28px 36px",
        background:C.shell,
        position:"relative",
        overflow:"hidden",
      }}>
        {/* Subtle radial glow accent */}
        <div style={{
          position:"absolute",top:-60,right:-60,width:200,height:200,borderRadius:"50%",
          background:"radial-gradient(circle, rgba(164,98,62,0.22), transparent 70%)",
          pointerEvents:"none",
        }}/>

        <div style={{position:"relative"}}>
          {/* Badge mark */}
          <div style={{
            width:48,height:48,borderRadius:"50%",
            background:"rgba(164,98,62,0.12)",
            border:`1.5px solid ${C.olive}`,
            ...fl("row","center","center"),
            marginBottom:16,
          }}>
            <Icon name="fire" size={22} color={C.oliveLt}/>
          </div>

          <div style={{fontFamily:FD,fontSize:34,color:"#F2EDDE",fontWeight:900,letterSpacing:"-0.015em",lineHeight:1}}>
            Hunt<span style={{color:C.oliveLt}}>Buddy</span>
          </div>

          <div style={{width:28,height:2,background:C.olive,margin:"12px 0 10px",borderRadius:1}}/>

          <div style={{fontSize:10.5,color:"#9C9F88",letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:600}}>
            Hunt Trip Companion
          </div>
        </div>
      </div>

      <div style={{background:C.surface,padding:"6px 16px",borderBottom:`1px solid ${C.border}`,...fl("row","center","center",0)}}>
        <div style={{
          width:"100%",maxWidth:340,background:C.base,borderRadius:8,
          padding:4,...fl("row","center","center",4),
          border:`1px solid ${C.border}`,
        }}>
          {[["signin","Sign In"],["register","Register"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{
              flex:1,padding:"10px 16px",border:"none",cursor:"pointer",borderRadius:6,
              fontFamily:FB,fontSize:13,fontWeight:700,letterSpacing:"0.04em",
              background:tab===k?C.olive:"transparent",
              color:tab===k?"#F2EDDE":C.canvas,
              boxShadow:tab===k?"0 2px 6px rgba(164,98,62,0.35)":"none",
              transition:"all 0.15s",
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"22px 24px",flex:1}}>

        {/* Profile photo -- register only */}
        {tab==="register" && (
          <div style={{...fl("column","center","center"),marginBottom:20}}>
            <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatar} style={{display:"none"}}/>
            <button onClick={()=>avatarRef.current?.click()} style={{
              width:76,height:76,borderRadius:"50%",padding:0,cursor:"pointer",
              border:`2px dashed ${avatar?C.olive:C.borderLt}`,
              background:avatar?"transparent":C.surface,
              overflow:"hidden",...fl("row","center","center"),
            }}>
              {avatar
                ? <img src={avatar} alt="Profile" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>
                : <div style={{...fl("column","center","center",3)}}>
                    <Icon name="user" size={24} color={C.dust}/>
                    <span style={{fontSize:8,color:C.dust,letterSpacing:"0.06em",textTransform:"uppercase"}}>Photo</span>
                  </div>
              }
            </button>
            {avatar
              ? <button onClick={()=>setAvatar(null)} style={{background:"none",border:"none",cursor:"pointer",marginTop:5,fontSize:10,color:C.dust}}>Remove</button>
              : <div style={{fontSize:10,color:C.dust,marginTop:6}}>Profile photo (optional)</div>
            }
          </div>
        )}

        {/* Form fields */}
        {[
          {l:"Email Address",k:"email",v:email,s:setEmail,p:"your@email.com",t:"text"},
          ...(tab==="register"?[{l:"Full Name",k:"name",v:name,s:setName,p:"e.g. Wihan du Preez",t:"text"}]:[]),
          {l:"Password",k:"pass",v:pass,s:setPass,p:"--------",t:"password"},
        ].map(f=>(
          <div key={f.k} style={{marginBottom:14}}>
            <SectionLabel style={{marginBottom:5}}>{f.l}</SectionLabel>
            <input value={f.v} onChange={e=>f.s(e.target.value)} type={f.t} placeholder={f.p} style={inp}/>
          </div>
        ))}

        {/* Banking details -- register only, optional, for in-app settlements */}
        {tab==="register" && (
          <div style={{marginBottom:14}}>
            <button
              onClick={()=>setAddBanking(b=>!b)}
              style={{
                width:"100%",background:C.surface,border:`1px solid ${C.border}`,
                borderRadius:3,padding:"10px 12px",cursor:"pointer",
                ...fl("row","center","space-between"),
              }}>
              <div style={{...fl("row","center","flex-start",8)}}>
                <Icon name="wallet" size={14} color={C.canvas}/>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:12,color:C.sand,fontWeight:600}}>Banking Details</div>
                  <div style={{fontSize:9.5,color:C.dust,marginTop:1}}>Optional -- lets other members pay you in-app</div>
                </div>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.dust} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{transform:addBanking?"rotate(180deg)":"none",transition:"transform 0.2s",flexShrink:0}}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {addBanking && (
              <div style={{marginTop:8,padding:"12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:3}}>
                <SectionLabel style={{marginBottom:5}}>Account Holder</SectionLabel>
                <input value={bankHolder} onChange={e=>setBankHolder(e.target.value)} placeholder="e.g. W du Preez" style={{...inp,marginBottom:10}}/>

                <SectionLabel style={{marginBottom:5}}>Bank</SectionLabel>
                <select value={bankName} onChange={e=>setBankName(e.target.value)} style={{...inp,marginBottom:10,appearance:"none"}}>
                  <option value="">Select your bank</option>
                  {["FNB","Standard Bank","ABSA","Nedbank","Capitec","TymeBank","Discovery Bank"].map(b=>(
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                <SectionLabel style={{marginBottom:5}}>Account Number</SectionLabel>
                <input value={bankAcc} onChange={e=>setBankAcc(e.target.value.replace(/\D/g,""))} placeholder="e.g. 62812345678" inputMode="numeric" style={{...inp,marginBottom:10}}/>

                <SectionLabel style={{marginBottom:5}}>Account Type</SectionLabel>
                <div style={{...fl("row","center","flex-start",8)}}>
                  {["Cheque","Savings"].map(t=>(
                    <button key={t} onClick={()=>setBankType(t)} style={{
                      flex:1,padding:"8px",borderRadius:3,cursor:"pointer",
                      background:bankType===t?C.olive:C.base,
                      border:`1px solid ${bankType===t?C.olive:C.border}`,
                      fontSize:11,fontWeight:600,color:bankType===t?"#F2EDDE":C.canvas,
                    }}>{t}</button>
                  ))}
                </div>

                <div style={{...fl("row","flex-start","flex-start",6),marginTop:10}}>
                  <Icon name="info" size={11} color={C.dust}/>
                  <span style={{fontSize:9.5,color:C.dust,lineHeight:1.5}}>Stored securely and only shown to camp members who owe you money during Settle Up.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* POPIA consent -- register only */}
        {tab==="register" && (
          <div style={{
            marginBottom:18,padding:"11px 12px",
            background:C.surface,border:`1px solid ${popia?C.olive:C.border}`,
            borderRadius:3,
          }}>
            <div style={{...fl("row","flex-start","flex-start",10)}}>
              <button onClick={()=>setPopia(p=>!p)} style={{
                width:18,height:18,borderRadius:2,flexShrink:0,marginTop:1,
                background:popia?C.olive:"transparent",
                border:`1.5px solid ${popia?C.olive:C.borderLt}`,
                cursor:"pointer",...fl("row","center","center"),padding:0,
              }}>
                {popia && <Icon name="check" size={12} color="#F2EDDE" sw={2.5}/>}
              </button>
              <div style={{flex:1}}>
                <span style={{fontSize:12,color:C.canvas,lineHeight:1.6}}>I have read and accept the </span>
                <span onClick={()=>setShowPopia(true)} style={{fontSize:12,color:C.olive,fontWeight:600,cursor:"pointer",textDecoration:"underline"}}>
                  HuntBuddy Privacy Notice (POPIA)
                </span>
                <span style={{fontSize:12,color:C.canvas}}> and consent to processing of my personal information.</span>
              </div>
            </div>
          </div>
        )}

        <Btn variant="primary" full disabled={!canSubmit} onClick={()=>onLogin({avatar,name,banking: bankHolder&&bankAcc ? {accountHolder:bankHolder,bank:bankName||"Not specified",accountNumber:bankAcc,accountType:bankType} : null})} style={{padding:"12px",fontSize:12}}>
          {tab==="signin"?"Sign In":"Create Account"}
        </Btn>
        {tab==="signin"&&<div style={{textAlign:"center",marginTop:14,fontSize:11,color:C.dust}}>
          Forgot password? <span style={{color:C.oliveLt,cursor:"pointer",fontWeight:600}}>Reset</span>
        </div>}
      </div>

      <div style={{padding:"16px 24px",borderTop:`1px solid ${C.border}`,textAlign:"center"}}>
        <span style={{fontSize:11,color:C.dust}}>{tab==="signin"?"No account? ":"Already registered? "}</span>
        <span style={{fontSize:11,color:C.oliveLt,cursor:"pointer",fontWeight:600}} onClick={()=>setTab(tab==="signin"?"register":"signin")}>
          {tab==="signin"?"Register":"Sign In"}
        </span>
      </div>
    </div>
  );
}

// =============================================================================
//  HOME
// =============================================================================
function HomeScreen({nav,camp,userName}) {
  return (
    <div style={{minHeight:"100vh",background:C.base}}>
      {/* Top bar */}
      <div style={{padding:"13px 16px",borderBottom:`1px solid #5A2E14`,background:C.shell,...fl("row","center","space-between")}}>
        <div style={{...fl("row","center","flex-start",8)}}>
          <Icon name="fire" size={17} color="#9C9F88"/>
          <span style={{fontFamily:FD,fontSize:18,color:"#F2EDDE",fontWeight:700}}>HuntBuddy</span>
        </div>
        <InitialAvatar name={userName||"You"} size={32}/>
      </div>

      <div style={{padding:"22px 16px"}}>
        <SectionLabel>Welcome</SectionLabel>
        <div style={{fontFamily:FD,fontSize:24,color:C.sand,fontWeight:700,marginBottom:24,lineHeight:1.2}}>
          {userName || "Hunter"}
        </div>

        {camp ? (
          <>
            {/* Active camp card */}
            <SectionLabel>Active Camp</SectionLabel>
            <Card style={{marginBottom:22}}>
              <button onClick={()=>nav("hub")} style={{width:"100%",background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left"}}>
                <div style={{padding:"15px 15px 13px"}}>
                  {/* Status row */}
                  <div style={{...fl("row","center","space-between"),marginBottom:10}}>
                    <div style={{fontFamily:FD,fontSize:17,color:C.sand,fontWeight:700}}>{camp.name}</div>
                    <div style={{...fl("row","center","flex-start",5),background:`${C.green}18`,border:`1px solid ${C.green}44`,borderRadius:2,padding:"2px 8px"}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:C.green}}/>
                      <span style={{fontSize:9,color:C.green,fontWeight:700,letterSpacing:"0.1em"}}>LIVE</span>
                    </div>
                  </div>
                  {/* Meta */}
                  <div style={{...fl("column","flex-start","flex-start",6)}}>
                    {camp.location && (
                      <div style={{...fl("row","center","flex-start",7)}}>
                        <Icon name="location" size={12} color={C.dust}/>
                        <span style={{fontSize:11,color:C.canvas}}>{camp.location}</span>
                      </div>
                    )}
                    {camp.dates && (
                      <div style={{...fl("row","center","flex-start",7)}}>
                        <Icon name="calendar" size={12} color={C.dust}/>
                        <span style={{fontSize:11,color:C.canvas}}>{camp.dates}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Rule/>
                <div style={{padding:"10px 15px",...fl("row","center","space-between")}}>
                  <div style={{...fl("row","center","flex-start",8)}}>
                    {camp.members.slice(0,4).map((m,i)=>(
                      <div key={m.id} style={{marginLeft:i>0?-8:0}}>
                        <InitialAvatar name={m.name} size={28} photo={m.photo||null}/>
                      </div>
                    ))}
                    <span style={{fontSize:11,color:C.dust,marginLeft:6}}>{camp.members.length} member{camp.members.length!==1?"s":""}</span>
                  </div>
                  <div style={{
                    background:C.olive,
                    borderRadius:4,
                    padding:"7px 14px",
                    ...fl("row","center","center",5),
                  }}>
                    <span style={{fontSize:12,color:"#F2EDDE",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase"}}>Open Camp</span>
                    <Icon name="chevR" size={13} color="#F2EDDE" sw={2}/>
                  </div>
                </div>
              </button>
            </Card>
          </>
        ) : (
          <>
            {/* Empty state -- no camp yet */}
            <Card style={{marginBottom:22,padding:"30px 20px",textAlign:"center"}}>
              <Icon name="tent" size={30} color={C.border}/>
              <div style={{fontFamily:FD,fontSize:16,color:C.sand,fontWeight:700,marginTop:12}}>No active camp</div>
              <div style={{fontSize:12,color:C.dust,marginTop:6,lineHeight:1.6}}>
                Start a new camp or join one with an invite code to get going.
              </div>
            </Card>
          </>
        )}

        {/* Action list */}
        <SectionLabel>Start or Join</SectionLabel>
        <Card>
          {[
            {label:"Start a New Camp",sub:"Plan a trip and invite your party",action:()=>nav("setup")},
            {label:"Join a Camp",    sub:"Enter an invite code from your camp leader",action:()=>nav("join")},
          ].map((r,i,arr)=>(
            <div key={r.label}>
              <button onClick={r.action} style={{
                width:"100%",padding:"14px 15px",background:"none",border:"none",
                cursor:"pointer",textAlign:"left",...fl("row","center","space-between"),
              }}>
                <div>
                  <div style={{fontSize:13,color:C.sand,fontWeight:500,marginBottom:2}}>{r.label}</div>
                  <div style={{fontSize:11,color:C.dust}}>{r.sub}</div>
                </div>
                <Icon name="chevR" size={16} color={C.dust}/>
              </button>
              {i<arr.length-1&&<Rule/>}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// =============================================================================
//  JOIN
// =============================================================================
function JoinScreen({nav,onJoin}) {
  const [code,setCode] = useState("");
  const [toast,show] = useToast();
  return (
    <div style={{minHeight:"100vh",background:C.base}}>
      <BackBar label="Join a Camp" onBack={()=>nav("home")}/>
      <div style={{padding:"28px 16px"}}>
        <SectionLabel>Invite Code</SectionLabel>
        <p style={{fontSize:12,color:C.canvas,marginBottom:20,lineHeight:1.7}}>
          Your camp leader shares a six-character code. Enter it below to join.
        </p>
        <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} maxLength={6} placeholder="BUSH26"
          style={{...inp,fontSize:28,fontFamily:FD,fontWeight:700,textAlign:"center",letterSpacing:"0.3em",padding:"16px",marginBottom:16,color:C.oliveLt}}/>
        <Btn variant="primary" full disabled={code.length<4}
          onClick={()=>{show("Camp found -- joining");setTimeout(()=>onJoin(code),1000);}} style={{padding:"12px"}}>
          Join Camp
        </Btn>
      </div>
      <Toast msg={toast}/>
    </div>
  );
}

// =============================================================================
//  SETUP
// =============================================================================
function SetupScreen({nav,onCreate}) {
  const [step,setStep] = useState(1);
  const [form,setForm] = useState({name:"",location:"",dateFrom:"",dateTo:"",desc:""});
  const [invited,setInvited] = useState([]);
  const toggle = id => setInvited(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);

  const ProgressBar = () => (
    <div style={{...fl("row","center","flex-start",6),padding:"10px 16px 0"}}>
      {[1,2].map(n=><div key={n} style={{flex:1,height:2,borderRadius:1,background:n<=step?C.olive:C.border,transition:"background 0.3s"}}/>)}
      <span style={{fontSize:9,color:C.dust,letterSpacing:"0.1em",marginLeft:8,whiteSpace:"nowrap"}}>Step {step} of 2</span>
    </div>
  );

  if (step===1) return (
    <div style={{minHeight:"100vh",background:C.base}}>
      <BackBar label="New Camp" onBack={()=>nav("home")}/>
      <ProgressBar/>
      <div style={{padding:"22px 16px 32px"}}>
        <div style={{fontFamily:FD,fontSize:21,color:C.sand,marginBottom:3}}>Name your camp</div>
        <p style={{fontSize:12,color:C.dust,marginBottom:22,lineHeight:1.65}}>Give this trip an identity. Your party will see this throughout the app.</p>
        {[
          {l:"Camp Name",k:"name",p:"e.g. Limpopo '25 Buffalo Season"},
          {l:"Location / Farm",k:"location",p:"e.g. Matetsi Conservancy, Limpopo"},
        ].map(f=>(
          <div key={f.k} style={{marginBottom:14}}>
            <SectionLabel style={{marginBottom:5}}>{f.l}</SectionLabel>
            <input value={form[f.k]} onChange={e=>setForm(ff=>({...ff,[f.k]:e.target.value}))} placeholder={f.p} style={inp}/>
          </div>
        ))}
        <div style={{...fl("row","center","flex-start",10),marginBottom:14}}>
          {[{l:"Arrival",k:"dateFrom",p:"12 Jun 2025"},{l:"Departure",k:"dateTo",p:"16 Jun 2025"}].map(f=>(
            <div key={f.k} style={{flex:1}}>
              <SectionLabel style={{marginBottom:5}}>{f.l}</SectionLabel>
              <input value={form[f.k]} onChange={e=>setForm(ff=>({...ff,[f.k]:e.target.value}))} placeholder={f.p} style={inp}/>
            </div>
          ))}
        </div>
        <div style={{marginBottom:24}}>
          <SectionLabel style={{marginBottom:5}}>Notes (optional)</SectionLabel>
          <textarea value={form.desc} onChange={e=>setForm(ff=>({...ff,desc:e.target.value}))} placeholder="Species planned, PH details, concession notes..." rows={3} style={{...inp,resize:"none"}}/>
        </div>
        <Btn variant="primary" full disabled={!form.name||!form.location} onClick={()=>setStep(2)} style={{padding:"12px"}}>
          Continue -- Invite Members
        </Btn>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.base}}>
      <BackBar label="Invite Members" onBack={()=>setStep(1)}/>
      <ProgressBar/>
      <div style={{padding:"22px 16px 32px"}}>
        <div style={{fontFamily:FD,fontSize:21,color:C.sand,marginBottom:3}}>Invite your party</div>
        <p style={{fontSize:12,color:C.dust,marginBottom:20,lineHeight:1.65}}>Select contacts -- they'll receive a notification with the camp code.</p>
        <Card style={{marginBottom:14}}>
          {CONTACTS.map((c,i)=>{
            const sel=invited.includes(c.id);
            return (
              <div key={c.id}>
                <button onClick={()=>toggle(c.id)} style={{
                  width:"100%",background:sel?C.olivePale:"transparent",
                  border:"none",cursor:"pointer",padding:"12px 14px",
                  ...fl("row","center","flex-start",12),
                }}>
                  <InitialAvatar name={c.name} size={38} accent={sel}/>
                  <div style={{flex:1,textAlign:"left"}}>
                    <div style={{fontSize:13,color:sel?C.sand:C.canvas,fontWeight:sel?600:400}}>{c.name}</div>
                    <div style={{fontSize:10,color:C.dust,marginTop:2}}>{c.role}</div>
                  </div>
                  <div style={{width:22,height:22,borderRadius:"50%",background:sel?C.olive:"transparent",border:`1.5px solid ${sel?C.olive:C.border}`,...fl("row","center","center")}}>
                    {sel&&<Icon name="check" size={12} color={C.sand} sw={2.5}/>}
                  </div>
                </button>
                {i<CONTACTS.length-1&&<Rule/>}
              </div>
            );
          })}
        </Card>
        <div style={{...fl("row","center","flex-start",8),marginBottom:22}}>
          <input placeholder="Invite by phone or WhatsApp..." style={{...inp,flex:1,padding:"9px 11px"}}/>
          <Btn variant="surface" small>Send</Btn>
        </div>
        <Btn variant="primary" full onClick={()=>onCreate(form,invited)} style={{padding:"12px"}}>
          Create Camp
        </Btn>
        <div style={{textAlign:"center",marginTop:10,fontSize:11,color:C.dust}}>
          {invited.length} member{invited.length!==1?"s":""} invited . More can be added later
        </div>
      </div>
    </div>
  );
}

// =============================================================================
//  TAB BAR  -- icon only when inactive, icon+label when active
// =============================================================================
const TABS = [
  {id:"camp",    label:"Camp",   icon:"tent"},
  {id:"photos",  label:"Photos", icon:"photo"},
  {id:"meals",   label:"Meals",  icon:"chef"},
  {id:"bills",   label:"Bills",  icon:"wallet"},
  {id:"gps",     label:"Track",   icon:"location"},
];

function TabBar({active,setTab}) {
  return (
    <div style={{
      background:C.shell,borderTop:`1px solid ${C.border}`,
      ...fl("row","center","space-around"),paddingBottom:6,
      position:"sticky",bottom:0,zIndex:100,
    }}>
      {TABS.map(t=>{
        const on = active===t.id;
        return (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1,background:"none",border:"none",cursor:"pointer",
            ...fl("column","center","center",5),
            padding:"10px 4px 6px",
            borderTop:`2px solid ${on?"#CFB586":"transparent"}`,
          }}>
            <Icon name={t.icon} size={24} color={on?"#CFB586":"#9C9F88"} sw={on?2:1.5}/>
            <span style={{
              fontSize:10,fontWeight:on?700:500,letterSpacing:"0.06em",
              textTransform:"uppercase",color:on?"#CFB586":"#9C9F88",
            }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
//  HUB WRAPPER
// =============================================================================
function HubWrapper({camp, setCamp, nav}) {
  const [tab,setTab]         = useState("camp");
  const [expenses,setExp]    = useState(INIT_EXPENSES);
  const [photos,setPhotos]   = useState(INIT_PHOTOS);
  const [meals,setMeals]     = useState({});

  const [campPhoto,setCampPhoto] = useState(null);

  const views = {
    camp:    <CampTab     camp={camp} setCamp={setCamp} expenses={expenses} campPhoto={campPhoto} setCampPhoto={setCampPhoto} photos={photos}/>,
    photos:  <PhotosTab   photos={photos} setPhotos={setPhotos} camp={camp}/>,
    meals:   <MealsTab    camp={camp} meals={meals} setMeals={setMeals}/>,
    bills:   <BillsTab    camp={camp} expenses={expenses} setExpenses={setExp}/>,
    gps:     <GPSTab     camp={camp}/>,
  };

  const activeTab = TABS.find(t=>t.id===tab);
  return (
    <div style={{display:"flex",flexDirection:"column",minHeight:"100vh",background:C.base}}>
      {/* Camp strip */}
      <div style={{background:C.shell,padding:"10px 16px 9px",borderBottom:`1px solid #5A2E14`,...fl("row","center","space-between")}}>
        <div style={{minWidth:0}}>
          <div style={{fontSize:9,color:"#B0B398",fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:1}}>Active Camp</div>
          <div style={{fontFamily:FD,fontSize:15,color:"#F2EDDE",fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{camp.name}</div>
        </div>
        <div style={{...fl("row","center","flex-end")}}>
          {camp.members.slice(0,4).map((m,i)=>(
            <div key={m.id} style={{marginLeft:i>0?-8:0}}>
              <InitialAvatar name={m.name} size={28} accent={m.you} photo={m.photo||null}/>
            </div>
          ))}
          {camp.members.length>4&&<div style={{marginLeft:-8,width:26,height:26,borderRadius:"50%",background:C.olive,...fl("row","center","center"),fontSize:9,fontWeight:700,color:C.sand}}>+{camp.members.length-4}</div>}
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto"}}>{views[tab]}</div>
      <TabBar active={tab} setTab={setTab}/>
    </div>
  );
}

function QueryBox() {
  const [msg,setMsg]   = useState("");
  const [sent,setSent] = useState(false);
  return (
    <div style={{
      marginTop:16,
      border:`1px solid ${C.border}`,
      borderRadius:3,overflow:"hidden",
    }}>
      {/* Thin label bar */}
      <div style={{
        background:C.surface,padding:"5px 12px",
        borderBottom:`1px solid ${C.border}`,
        ...fl("row","center","space-between"),
      }}>
        <span style={{fontSize:8,color:C.dust,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase"}}>Log a Query</span>
        <span style={{fontSize:9,color:C.dust}}>support@huntbuddy.app</span>
      </div>
      {sent ? (
        <div style={{padding:"12px 14px",...fl("row","center","flex-start",8)}}>
          <Icon name="check" size={14} color={C.olive} sw={2}/>
          <span style={{fontSize:12,color:C.canvas}}>Query sent -- we'll respond within 24 hours.</span>
        </div>
      ) : (
        <div style={{padding:"10px 12px",...fl("row","center","flex-start",8)}}>
          <input
            value={msg}
            onChange={e=>setMsg(e.target.value)}
            placeholder="Describe your issue or question..."
            style={{...inp,flex:1,padding:"7px 10px",fontSize:11}}
          />
          <Btn variant="primary" small disabled={!msg.trim()} onClick={()=>setSent(true)} style={{flexShrink:0,padding:"7px 12px"}}>
            Send
          </Btn>
        </div>
      )}
    </div>
  );
}

// =============================================================================
//  TAB: CAMP
// =============================================================================
function CampTab({camp, setCamp, expenses, campPhoto, setCampPhoto, photos=[]}) {
  const total     = expenses.reduce((s,e)=>s+e.amount,0);
  const fileRef   = useRef(null);
  const [loading, setLoading] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [archived, setArchived]   = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [profileMember, setProfileMember] = useState(null);

  const handleArchive = () => {
    setArchiving(true);
    setTimeout(() => {
      setArchiving(false);
      setArchived(true);
      setShowSlideshow(true);
    }, 1400);
  };

  const handleFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = ev => { setCampPhoto(ev.target.result); setLoading(false); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const MetaRow = ({icon,label,val,action}) => (
    <div style={{...fl("row","center","space-between"),padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
      <div style={{...fl("row","center","flex-start",10)}}>
        <Icon name={icon} size={13} color={C.dust}/>
        <span style={{fontSize:11,color:C.dust,width:66}}>{label}</span>
        <span style={{fontSize:12,color:C.canvas,flex:1}}>{val}</span>
      </div>
      {action&&<button onClick={action.fn} style={{background:"none",border:"none",cursor:"pointer",...fl("row","center","flex-start",4),padding:0}}>
        <span style={{fontSize:10,color:C.oliveLt,fontWeight:600}}>{action.label}</span>
      </button>}
    </div>
  );

  return (
    <>
    <div style={{paddingBottom:28}}>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>

      {/* Camp photo banner */}
      <div style={{position:"relative",width:"100%",height:campPhoto?180:110,overflow:"hidden",background:C.shell,cursor:"pointer"}}
        onClick={()=>fileRef.current?.click()}>
        {campPhoto ? (
          <>
            <img src={campPhoto} alt="Camp" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
            {/* Gradient overlay */}
            <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 50%,rgba(0,0,0,0.55))"}}/>
            {/* Camp name overlay */}
            <div style={{position:"absolute",bottom:10,left:14,right:70}}>
              <div style={{fontFamily:FD,fontSize:18,color:"#fff",fontWeight:700,lineHeight:1.2,textShadow:"0 1px 4px rgba(0,0,0,0.6)"}}>{camp.name}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.75)",marginTop:2}}>{camp.location}</div>
            </div>
            {/* Change photo button */}
            <button
              onClick={e=>{e.stopPropagation();fileRef.current?.click();}}
              style={{
                position:"absolute",bottom:10,right:12,
                background:"rgba(0,0,0,0.5)",border:`1px solid rgba(255,255,255,0.3)`,
                borderRadius:3,padding:"4px 10px",cursor:"pointer",
                ...fl("row","center","center",5),
              }}>
              <Icon name="photo" size={11} color="#fff"/>
              <span style={{fontSize:9,color:"#fff",fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase"}}>Change</span>
            </button>
          </>
        ) : (
          /* Empty state */
          <div style={{width:"100%",height:"100%",...fl("column","center","center",8)}}>
            {loading ? (
              <div style={{fontSize:12,color:C.dust}}>Loading...</div>
            ) : (
              <>
                <Icon name="photo" size={28} color={C.dust}/>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:13,color:"#F2EDDE",fontWeight:600,marginBottom:3}}>Add a camp photo</div>
                  <div style={{fontSize:10,color:C.dust}}>Tap to upload from gallery or camera</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div style={{padding:"16px 16px 0"}}>
        <SectionLabel>Trip Details</SectionLabel>
        <Card style={{padding:"0 14px",marginBottom:16}}>
          <MetaRow icon="tent"     label="Camp"     val={camp.name}/>
          <MetaRow icon="location" label="Location" val={camp.location}/>
          <MetaRow icon="calendar" label="Dates"    val={camp.dates}/>
          <MetaRow icon="key"      label="Code"     val={camp.code} action={{label:"Copy",fn:()=>{}}}/>
        </Card>

        <WeatherWidget location={camp.location}/>

        <SectionLabel>Party Members</SectionLabel>

        {/* 2x2 member bubble grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {camp.members.slice(0,4).map(m=>(
            <button key={m.id} onClick={()=>setProfileMember(m)} style={{
              background:C.surface,border:`1px solid ${m.you?C.olive:C.borderLt}`,
              borderRadius:6,padding:"14px 10px",cursor:"pointer",
              ...fl("column","center","center",8),
            }}>
              <InitialAvatar name={m.name} size={62} accent={m.you} photo={m.photo||null}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:12,fontWeight:m.you?700:500,color:m.you?C.oliveLt:C.sand,lineHeight:1.2}}>
                  {m.you?"You":m.name.split(" ")[0]}
                </div>
                <div style={{fontSize:8.5,color:C.dust,marginTop:1,letterSpacing:"0.06em",textTransform:"uppercase"}}>{m.role}</div>
                {m.lastSeen && (
                  <div style={{...fl("row","center","center",3),marginTop:4}}>
                    <div style={{
                      width:5,height:5,borderRadius:"50%",flexShrink:0,
                      background:m.lastSeen==="now"?"#5A7A3A":C.border,
                    }}/>
                    <span style={{fontSize:8,color:m.lastSeen==="now"?"#5A7A3A":C.dust,fontWeight:m.lastSeen==="now"?700:400}}>
                      {m.lastSeen==="now"?"Active now":`Seen ${m.lastSeen}`}
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
          {/* Add member tile */}
          <button style={{
            background:"transparent",border:`1px dashed ${C.border}`,
            borderRadius:6,padding:"14px 10px",
            ...fl("column","center","center",6),
            cursor:"pointer",minHeight:118,
          }}>
            <div style={{width:46,height:46,borderRadius:"50%",border:`1.5px dashed ${C.border}`,...fl("row","center","center")}}>
              <Icon name="plus" size={18} color={C.dust}/>
            </div>
            <span style={{fontSize:10,color:C.dust,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase"}}>Add</span>
          </button>
        </div>

      <Btn variant="danger" full disabled={archiving} onClick={handleArchive} style={{padding:"10px"}}>
        {archiving ? "Archiving Camp..." : archived ? "Camp Archived" : "End Camp & Archive"}
      </Btn>
      {archived && (
        <button onClick={()=>setShowSlideshow(true)} style={{
          width:"100%",marginTop:8,background:"none",border:`1px solid ${C.olive}`,
          borderRadius:3,padding:"8px",cursor:"pointer",...fl("row","center","center",6),
        }}>
          <Icon name="photo" size={13} color={C.olive}/>
          <span style={{fontSize:11,color:C.olive,fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase"}}>View Keepsake Slideshow</span>
        </button>
      )}

      {/* Query / feedback frame */}
      <QueryBox/>
      </div>
    </div>

    {showSlideshow && (
      <CampSlideshow camp={camp} photos={photos} onClose={()=>setShowSlideshow(false)}/>
    )}

    {profileMember && (
      <MemberProfileScreen
        member={profileMember}
        isYou={!!profileMember.you}
        onClose={()=>setProfileMember(null)}
        onSave={banking => {
          setCamp(c=>({...c,members:c.members.map(m=>m.id===profileMember.id?{...m,banking}:m)}));
          setProfileMember(null);
        }}
      />
    )}
    </>
  );
}

// =============================================================================
//  MEMBER PROFILE -- view/edit banking details for in-app settlements
// =============================================================================
function MemberProfileScreen({member, isYou, onClose, onSave}) {
  const b = member.banking;
  const [editing, setEditing] = useState(false);
  const [holder, setHolder]   = useState(b?.accountHolder || "");
  const [bank, setBank]       = useState(b?.bank || "");
  const [acc, setAcc]         = useState(b?.accountNumber || "");
  const [type, setType]       = useState(b?.accountType || "Cheque");
  const [toast, show]         = useToast();

  const maskAcc = num => num ? `${"*".repeat(Math.max(0,num.length-4))}${num.slice(-4)}` : "";

  const save = () => {
    if (!holder || !acc) return;
    onSave({accountHolder:holder, bank:bank||"Not specified", accountNumber:acc, accountType:type});
    show("Banking details saved");
  };

  return (
    <div style={{position:"fixed",inset:0,background:C.base,zIndex:150,...fl("column","stretch","flex-start"),overflowY:"auto"}}>
      <BackBar label={isYou ? "Your Profile" : member.name.split(" ")[0]} onBack={onClose}/>

      <div style={{padding:"20px 20px 40px"}}>
        {/* Identity header */}
        <div style={{...fl("column","center","center",0),marginBottom:24}}>
          <InitialAvatar name={member.name} size={72} accent={isYou} photo={member.photo||null}/>
          <div style={{fontFamily:FD,fontSize:18,fontWeight:700,color:C.sand,marginTop:10}}>{member.name}</div>
          <div style={{fontSize:11,color:C.dust,marginTop:2,letterSpacing:"0.06em",textTransform:"uppercase"}}>{member.role}</div>
        </div>

        <SectionLabel style={{marginBottom:8}}>Banking Details</SectionLabel>

        {!editing ? (
          <>
            {b ? (
              <Card style={{marginBottom:14}}>
                <div style={{padding:"12px 14px",...fl("row","center","space-between"),borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:11,color:C.dust}}>Account Holder</span>
                  <span style={{fontSize:12,color:C.sand,fontWeight:600}}>{b.accountHolder}</span>
                </div>
                <div style={{padding:"12px 14px",...fl("row","center","space-between"),borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:11,color:C.dust}}>Bank</span>
                  <span style={{fontSize:12,color:C.sand,fontWeight:600}}>{b.bank}</span>
                </div>
                <div style={{padding:"12px 14px",...fl("row","center","space-between"),borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:11,color:C.dust}}>Account Number</span>
                  <span style={{fontSize:12,color:C.sand,fontWeight:600,fontFamily:"monospace",letterSpacing:"0.04em"}}>{isYou ? b.accountNumber : maskAcc(b.accountNumber)}</span>
                </div>
                <div style={{padding:"12px 14px",...fl("row","center","space-between")}}>
                  <span style={{fontSize:11,color:C.dust}}>Account Type</span>
                  <span style={{fontSize:12,color:C.sand,fontWeight:600}}>{b.accountType}</span>
                </div>
              </Card>
            ) : (
              <Card style={{padding:"24px",textAlign:"center",marginBottom:14}}>
                <Icon name="wallet" size={24} color={C.border}/>
                <div style={{fontSize:12,color:C.dust,marginTop:8}}>
                  {isYou ? "No banking details added yet" : `${member.name.split(" ")[0]} hasn't added banking details yet`}
                </div>
              </Card>
            )}

            {isYou && (
              <Btn variant="primary" full onClick={()=>setEditing(true)} style={{padding:"12px"}}>
                {b ? "Edit Banking Details" : "Add Banking Details"}
              </Btn>
            )}

            {!isYou && (
              <div style={{...fl("row","flex-start","flex-start",6),marginTop:6}}>
                <Icon name="info" size={11} color={C.dust}/>
                <span style={{fontSize:9.5,color:C.dust,lineHeight:1.5}}>Only visible to you for settling shared expenses in the Bills tab.</span>
              </div>
            )}
          </>
        ) : (
          <Card style={{padding:"14px"}}>
            <SectionLabel style={{marginBottom:5}}>Account Holder</SectionLabel>
            <input value={holder} onChange={e=>setHolder(e.target.value)} placeholder="e.g. W du Preez" style={{...inp,marginBottom:12}}/>

            <SectionLabel style={{marginBottom:5}}>Bank</SectionLabel>
            <select value={bank} onChange={e=>setBank(e.target.value)} style={{...inp,marginBottom:12,appearance:"none"}}>
              <option value="">Select your bank</option>
              {["FNB","Standard Bank","ABSA","Nedbank","Capitec","TymeBank","Discovery Bank"].map(bk=>(
                <option key={bk} value={bk}>{bk}</option>
              ))}
            </select>

            <SectionLabel style={{marginBottom:5}}>Account Number</SectionLabel>
            <input value={acc} onChange={e=>setAcc(e.target.value.replace(/\D/g,""))} placeholder="e.g. 62812345678" inputMode="numeric" style={{...inp,marginBottom:12}}/>

            <SectionLabel style={{marginBottom:5}}>Account Type</SectionLabel>
            <div style={{...fl("row","center","flex-start",8),marginBottom:16}}>
              {["Cheque","Savings"].map(t=>(
                <button key={t} onClick={()=>setType(t)} style={{
                  flex:1,padding:"9px",borderRadius:3,cursor:"pointer",
                  background:type===t?C.olive:C.base,
                  border:`1px solid ${type===t?C.olive:C.border}`,
                  fontSize:11,fontWeight:600,color:type===t?"#F2EDDE":C.canvas,
                }}>{t}</button>
              ))}
            </div>

            <div style={{...fl("row","center","flex-start",10)}}>
              <Btn variant="primary" onClick={save} style={{flex:1,padding:"11px"}}>Save</Btn>
              <Btn variant="ghost" small onClick={()=>setEditing(false)}>Cancel</Btn>
            </div>
          </Card>
        )}
      </div>
      <Toast msg={toast}/>
    </div>
  );
}

// =============================================================================
//  CAMP SLIDESHOW -- keepsake sent to all members on archive
// =============================================================================
function CampSlideshow({camp, photos, onClose}) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [sent, setSent] = useState(false);
  const timerRef = useRef(null);

  const slides = photos.length>0 ? photos : [{id:0,caption:"No photos were shared this trip",url:null,by:"",time:""}];

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => setIdx(i => (i+1) % slides.length), 2800);
    return () => clearInterval(timerRef.current);
  }, [playing, slides.length]);

  const sendToAll = () => {
    setSent(true);
    setTimeout(()=>setSent(false), 2600);
  };

  const slide = slides[idx];

  return (
    <div style={{
      position:"fixed",inset:0,background:"#0A0502",zIndex:200,
      ...fl("column","stretch","flex-start"),
    }}>
      {/* Header */}
      <div style={{padding:"14px 16px",...fl("row","center","space-between"),flexShrink:0}}>
        <div>
          <div style={{fontSize:9,color:"#CFB586",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase"}}>Keepsake Slideshow</div>
          <div style={{fontFamily:FD,fontSize:15,color:"#F2EDDE",fontWeight:700}}>{camp.name}</div>
        </div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",...fl("row","center","center")}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F2EDDE" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Slide area */}
      <div style={{flex:1,position:"relative",...fl("row","center","center"),overflow:"hidden"}}>
        {slide.url ? (
          <img src={slide.url} alt={slide.caption} style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain"}}/>
        ) : (
          <div style={{...fl("column","center","center",10)}}>
            <Icon name="photo" size={36} color="#5A3420"/>
            <span style={{fontSize:13,color:"#9C9F88"}}>{slide.caption}</span>
          </div>
        )}
        {/* Caption overlay */}
        {slide.url && (
          <div style={{
            position:"absolute",bottom:0,left:0,right:0,
            background:"linear-gradient(transparent,rgba(0,0,0,0.75))",
            padding:"40px 20px 16px",
          }}>
            {slide.caption && <div style={{fontFamily:FD,fontSize:16,color:"#fff",fontWeight:700,textShadow:"0 1px 4px rgba(0,0,0,0.6)"}}>{slide.caption}</div>}
            <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginTop:3}}>{slide.by} -- {slide.time}</div>
          </div>
        )}
      </div>

      {/* Progress dots */}
      <div style={{...fl("row","center","center",5),padding:"10px 16px",flexShrink:0}}>
        {slides.map((s,i)=>(
          <div key={s.id} style={{
            width:i===idx?16:6,height:6,borderRadius:3,
            background:i===idx?"#CFB586":"rgba(255,255,255,0.25)",
            transition:"all 0.25s",
          }}/>
        ))}
      </div>

      {/* Controls */}
      <div style={{padding:"8px 16px 20px",...fl("row","center","center",16),flexShrink:0}}>
        <button onClick={()=>setIdx(i=>(i-1+slides.length)%slides.length)} style={{background:"none",border:"none",cursor:"pointer",padding:8}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F2EDDE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button onClick={()=>setPlaying(p=>!p)} style={{
          background:"#A4623E",border:"none",borderRadius:"50%",width:46,height:46,cursor:"pointer",
          ...fl("row","center","center"),
        }}>
          {playing
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#F2EDDE"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="#F2EDDE"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          }
        </button>
        <button onClick={()=>setIdx(i=>(i+1)%slides.length)} style={{background:"none",border:"none",cursor:"pointer",padding:8}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F2EDDE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Send to all members */}
      <div style={{padding:"0 16px 24px",flexShrink:0}}>
        {sent ? (
          <div style={{
            background:"rgba(90,122,58,0.2)",border:"1px solid #5A7A3A",borderRadius:4,
            padding:"11px",textAlign:"center",...fl("row","center","center",6),
          }}>
            <Icon name="check" size={14} color="#5ACA5A" sw={2}/>
            <span style={{fontSize:12,color:"#5ACA5A",fontWeight:600}}>Sent to all {camp.members.length} members</span>
          </div>
        ) : (
          <button onClick={sendToAll} style={{
            width:"100%",background:"#A4623E",border:"none",borderRadius:4,
            padding:"12px",cursor:"pointer",...fl("row","center","center",7),
          }}>
            <Icon name="share" size={14} color="#F2EDDE"/>
            <span style={{fontSize:12,fontWeight:700,color:"#F2EDDE",letterSpacing:"0.04em",textTransform:"uppercase"}}>Send Keepsake to All Members</span>
          </button>
        )}
        <div style={{textAlign:"center",fontSize:9,color:"#6B5040",marginTop:8}}>{slides.length} photo{slides.length!==1?"s":""} from this trip</div>
      </div>
    </div>
  );
}

function SelDayMeals({ days, selDay, getMeal, openEdit }) {
  const d = days.find(x => x.key === selDay);
  if (!d) return null;
  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{...fl("row","center","flex-start",8),marginBottom:12}}>
        <div style={{fontFamily:FD,fontSize:16,fontWeight:700,color:C.sand}}>{d.dn}</div>
        <div style={{fontSize:13,color:C.dust}}>{d.num} {d.mn}</div>
      </div>
      <Card style={{marginBottom:16}}>
        {MEAL_SLOTS.map((slot,si)=>{
          const meal = getMeal(d.key, slot.id);
          return (
            <div key={slot.id}>
              <button onClick={()=>openEdit(d.key, slot.id)} style={{
                width:"100%", background:meal?C.olivePale:"transparent",
                border:"none", cursor:"pointer", padding:"14px 14px",
                ...fl("row","center","flex-start",12), textAlign:"left",
              }}>
                <div style={{width:58,flexShrink:0,...fl("column","flex-start","center",4)}}>
                  <Icon name={slot.icon} size={15} color={meal?C.olive:C.dust} sw={1.5}/>
                  <div style={{fontSize:9,color:meal?C.oliveLt:C.dust,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginTop:3}}>{slot.label}</div>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  {meal ? (
                    <>
                      <div style={{fontSize:13,color:C.sand,fontWeight:600,lineHeight:1.3,marginBottom:2}}>{meal.dish}</div>
                      {meal.cook && <div style={{fontSize:10,color:C.canvas}}>Cook: {meal.cook.split(", ").filter(Boolean).map(n=>n.split(" ")[0]).join(" & ")}</div>}
                      {meal.notes && <div style={{fontSize:10,color:C.dust,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{meal.notes}</div>}
                    </>
                  ) : (
                    <div style={{...fl("row","center","flex-start",6)}}>
                      <Icon name="plus" size={13} color={C.dust}/>
                      <span style={{fontSize:12,color:C.dust}}>Plan {slot.label.toLowerCase()}</span>
                    </div>
                  )}
                </div>
                {meal && <Icon name="edit" size={13} color={C.dust}/>}
              </button>
              {si < MEAL_SLOTS.length-1 && <Rule/>}
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// =============================================================================
//  TAB: MEALS
// =============================================================================
function MealsTab({camp,meals,setMeals}) {
  const days = getTripDays(camp.dateFrom||"2025-06-12",camp.dateTo||"2025-06-16");
  const [editing,setEditing] = useState(null);
  const [toast,show] = useToast();
  const [selDay,setSelDay] = useState(days[0]?.key);

  const getMeal = (dk,mid) => meals[`${dk}_${mid}`]||null;

  const openEdit = (dayKey,mealId) => {
    const ex = getMeal(dayKey,mealId);
    // cook stored as comma-separated string for backward compat; parse to array
    const cookArr = ex?.cook ? ex.cook.split(", ").filter(Boolean) : [];
    setEditing({dayKey,mealId,dish:ex?.dish||"",cooks:cookArr,notes:ex?.notes||""});
  };
  const saveMeal = () => {
    if(!editing.dish) return;
    setMeals(m=>({...m,[`${editing.dayKey}_${editing.mealId}`]:{
      dish:editing.dish,
      cook:editing.cooks.join(", "),  // store as comma-separated
      notes:editing.notes,
    }}));
    setEditing(null);show("Meal saved");
  };
  const toggleCook = name => setEditing(ed=>({
    ...ed,
    cooks: ed.cooks.includes(name)
      ? ed.cooks.filter(c=>c!==name)
      : [...ed.cooks, name],
  }));
  const clearMeal = (dk,mid) => {
    setMeals(m=>{const n={...m};delete n[`${dk}_${mid}`];return n;});
    setEditing(null);show("Meal removed");
  };

  // Edit screen
  if (editing) {
    const day = days.find(d=>d.key===editing.dayKey);
    const slot = MEAL_SLOTS.find(s=>s.id===editing.mealId);
    const existing = getMeal(editing.dayKey,editing.mealId);
    return (
      <div style={{background:C.base,minHeight:"100%"}}>
        <BackBar label={`${slot?.label} . ${day?.dn} ${day?.num} ${day?.mn}`} onBack={()=>setEditing(null)}/>
        <div style={{padding:"20px 16px 32px"}}>
          <div style={{marginBottom:14}}>
            <SectionLabel style={{marginBottom:5}}>Dish / Meal Name</SectionLabel>
            <input value={editing.dish} onChange={e=>setEditing(ed=>({...ed,dish:e.target.value}))}
              placeholder="e.g. Impala braai with boerewors" style={inp}/>
          </div>

          <div style={{marginBottom:14}}>
            <SectionLabel style={{marginBottom:4}}>Cook on Duty</SectionLabel>
            <div style={{fontSize:10,color:C.dust,marginBottom:8}}>Select one or more -- multiple cooks allowed.</div>
            <Card>
              {camp.members.map((m,i)=>{
                const selected = editing.cooks.includes(m.name);
                return (
                  <div key={m.id}>
                    <button onClick={()=>toggleCook(m.name)} style={{
                      width:"100%",padding:"11px 14px",
                      background:selected?C.olivePale:"transparent",
                      border:"none",cursor:"pointer",...fl("row","center","space-between"),
                    }}>
                      <div style={{...fl("row","center","flex-start",10)}}>
                        <InitialAvatar name={m.name} size={32} accent={selected}/>
                        <span style={{fontSize:12,color:selected?C.sand:C.canvas,fontWeight:selected?600:400}}>
                          {m.you?"You -- "+m.name:m.name}
                        </span>
                      </div>
                      <div style={{
                        width:20,height:20,borderRadius:3,flexShrink:0,
                        background:selected?C.olive:"transparent",
                        border:`1.5px solid ${selected?C.olive:C.border}`,
                        ...fl("row","center","center"),
                      }}>
                        {selected&&<Icon name="check" size={12} color="#F2EDDE" sw={2.5}/>}
                      </div>
                    </button>
                    {i<camp.members.length-1&&<Rule/>}
                  </div>
                );
              })}
            </Card>
            {editing.cooks.length>0&&(
              <div style={{marginTop:8,fontSize:11,color:C.dust}}>
                Assigned: <span style={{color:C.canvas,fontWeight:600}}>{editing.cooks.map(n=>n.split(" ")[0]).join(" & ")}</span>
              </div>
            )}
          </div>

          <div style={{marginBottom:24}}>
            <SectionLabel style={{marginBottom:5}}>Notes (optional)</SectionLabel>
            <textarea value={editing.notes} onChange={e=>setEditing(ed=>({...ed,notes:e.target.value}))}
              placeholder="Ingredients, prep notes, dietary requirements..." rows={3}
              style={{...inp,resize:"none"}}/>
          </div>

          <div style={{...fl("row","center","flex-start",10)}}>
            <Btn variant="primary" onClick={saveMeal} disabled={!editing.dish} style={{flex:1,padding:"11px"}}>Save Meal</Btn>
            {existing&&<Btn variant="danger" onClick={()=>clearMeal(editing.dayKey,editing.mealId)} style={{padding:"11px 14px"}}>Remove</Btn>}
          </div>
        </div>
        <Toast msg={toast}/>
      </div>
    );
  }

  // Calendar view
  return (
    <div style={{background:C.base,minHeight:"100%"}}>
      {/* Day selector strip -- light ground, high contrast */}
      <div style={{
        background:C.surface,
        borderBottom:`2px solid ${C.border}`,
        overflowX:"auto",WebkitOverflowScrolling:"touch",
        boxShadow:`0 2px 8px ${C.border}44`,
      }}>
        <div style={{...fl("row","stretch","flex-start"),minWidth:"max-content"}}>
          {days.map(d=>{
            const on = selDay===d.key;
            const cnt = MEAL_SLOTS.filter(s=>getMeal(d.key,s.id)).length;
            return (
              <button key={d.key} onClick={()=>setSelDay(d.key)} style={{
                flexShrink:0, padding:"12px 18px 10px", textAlign:"center",
                background: on ? C.shell : "transparent",
                border:"none", cursor:"pointer", minWidth:72,
                borderBottom:`3px solid ${on?C.olive:"transparent"}`,
                borderRight:`1px solid ${C.border}`,
                transition:"background 0.15s",
              }}>
                {/* Day name */}
                <div style={{
                  fontSize:10, fontWeight:700, letterSpacing:"0.12em",
                  textTransform:"uppercase", marginBottom:4,
                  color: on ? "#CFB586" : C.dust,
                }}>{d.dn}</div>
                {/* Date number */}
                <div style={{
                  fontFamily:FD, fontSize:22, fontWeight:700, lineHeight:1, marginBottom:3,
                  color: on ? "#F2EDDE" : C.sand,
                }}>{d.num}</div>
                {/* Month */}
                <div style={{
                  fontSize:10, marginBottom:8, fontWeight:500,
                  color: on ? "#9C9F88" : C.dust,
                }}>{d.mn}</div>
                {/* Meal indicator dots -- labelled */}
                <div style={{...fl("row","center","center",4)}}>
                  {MEAL_SLOTS.map(s=>{
                    const has = !!getMeal(d.key,s.id);
                    return (
                      <div key={s.id} style={{
                        width:7, height:7, borderRadius:"50%",
                        background: has
                          ? (on ? "#CFB586" : C.olive)
                          : (on ? "#5A2E14" : C.border),
                        transition:"background 0.15s",
                      }}/>
                    );
                  })}
                </div>
                {/* Meal count label */}
                {cnt > 0 && (
                  <div style={{
                    marginTop:5, fontSize:9, fontWeight:600, letterSpacing:"0.06em",
                    color: on ? "#CFB586" : C.olive,
                  }}>{cnt}/3</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day meals -- full detail */}
      {selDay && <SelDayMeals days={days} selDay={selDay} getMeal={getMeal} openEdit={openEdit}/>}

      <Toast msg={toast}/>
    </div>
  );
}

// =============================================================================
//  TAB: PHOTOS
// =============================================================================
function PhotosTab({photos,setPhotos,camp}) {
  const [preview,setPreview] = useState(null);
  const [addMode,setAddMode] = useState(false);
  const [caption,setCaption] = useState("");
  const [staged,setStaged]   = useState([]);  // [{dataUrl, name}, ...]
  const [loading,setLoading] = useState(false);
  const [toast,show]         = useToast();
  const fileRef              = useRef(null);

  const toggleLike = id => setPhotos(p=>p.map(x=>x.id===id?{...x,liked:!x.liked,likes:x.liked?x.likes-1:x.likes+1}:x));

  // Download the original full-resolution image to the device
  const downloadPhoto = photo => {
    if (!photo?.url) return;
    const a = document.createElement("a");
    a.href = photo.url;
    const safeCaption = (photo.caption||"huntbuddy-photo").replace(/[^a-z0-9]+/gi,"-").toLowerCase();
    a.download = `${safeCaption}-${photo.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    show("Downloading original photo -");
  };

  // Read one or more files from device into base64 dataURLs
  const handleFileChange = e => {
    const files = Array.from(e.target.files||[]);
    if (!files.length) return;
    setLoading(true);
    let loaded = 0;
    const results = [];
    files.forEach((file,i)=>{
      const reader = new FileReader();
      reader.onload = ev => {
        results[i] = { dataUrl: ev.target.result, name: file.name };
        loaded++;
        if (loaded === files.length) {
          setStaged(s => [...s, ...results.filter(Boolean)]);
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    });
    // reset input so same files can be re-selected
    e.target.value = "";
  };

  const removeStaged = idx => setStaged(s => s.filter((_,i)=>i!==idx));

  const publish = () => {
    if (!staged.length) return;
    const time = new Date().toLocaleTimeString("en-ZA",{hour:"2-digit",minute:"2-digit"});
    const youName = camp?.members?.find(m=>m.you)?.name || "You";
    setPhotos(p=>[
      ...p,
      ...staged.map((s,i)=>({
        id:    Date.now()+i,
        caption: staged.length>1 && caption ? `${caption} (${i+1}/${staged.length})` : caption,
        by:    youName,
        time,
        likes: 0,
        liked: false,
        url:   s.dataUrl,   // - real base64 image
      })),
    ]);
    setCaption(""); setStaged([]); setAddMode(false);
    show(staged.length>1 ? `${staged.length} photos shared to camp album -` : "Photo shared to camp album -");
  };

  // -- Preview screen ------------------------------------------
  if (preview) return (
    <div style={{background:C.base,minHeight:"100%"}}>
      <BackBar label="Photo" onBack={()=>setPreview(null)}/>
      <div style={{position:"relative",width:"100%",height:300,overflow:"hidden",background:C.surface}}>
        {preview.url
          ? <img src={preview.url} alt={preview.caption} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
          : <div style={{width:"100%",height:"100%",...fl("column","center","center")}}><Icon name="photo" size={40} color={C.border}/></div>
        }
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:90,background:"linear-gradient(transparent,rgba(0,0,0,0.6))",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:14,left:14,right:14}}>
          {preview.caption && <div style={{fontFamily:FD,fontSize:17,color:"#fff",fontWeight:700,lineHeight:1.3,textShadow:"0 1px 4px rgba(0,0,0,0.6)"}}>{preview.caption}</div>}
        </div>
      </div>
      <div style={{padding:"14px 16px"}}>
        <div style={{...fl("row","center","space-between"),marginBottom:14}}>
          <div>
            <div style={{fontSize:12,color:C.canvas,fontWeight:500}}>{preview.by}</div>
            <div style={{fontSize:10,color:C.dust,marginTop:1}}>{preview.time}</div>
          </div>
          <div style={{...fl("row","center","flex-end",14)}}>
            <button
              onClick={()=>{toggleLike(preview.id);setPreview(p=>({...p,liked:!p.liked,likes:p.liked?p.likes-1:p.likes+1}));}}
              style={{...fl("row","center","flex-start",6),background:"none",border:"none",cursor:"pointer",padding:0}}>
              <Icon name="heart" size={22} color={preview.liked?C.olive:C.dust} sw={preview.liked?2:1.5}/>
              <span style={{fontSize:14,color:preview.liked?C.oliveLt:C.dust,fontWeight:600}}>{preview.likes}</span>
            </button>
            <button onClick={()=>downloadPhoto(preview)} style={{...fl("row","center","flex-start",6),background:"none",border:"none",cursor:"pointer",padding:0}}>
              <Icon name="download" size={18} color={C.dust}/>
            </button>
            <button style={{...fl("row","center","flex-start",6),background:"none",border:"none",cursor:"pointer",padding:0}}>
              <Icon name="share" size={18} color={C.dust}/>
            </button>
          </div>
        </div>
        <Rule/>
        <div style={{paddingTop:10,fontSize:11,color:C.dust}}>Shared to camp album . {preview.time}</div>
      </div>
    </div>
  );

  // -- Add photo screen ----------------------------------------
  if (addMode) return (
    <div style={{background:C.base,minHeight:"100%"}}>
      <BackBar label="Add Photo" onBack={()=>{ setAddMode(false); setStaged([]); setCaption(""); }}/>

      {/* Hidden real file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handleFileChange}
        style={{display:"none"}}
      />

      <div style={{padding:"20px 16px"}}>
        {/* Upload / preview zone */}
        {staged.length===0 ? (
          <div>
            {/* Camera button */}
            <button
              onClick={()=>{ fileRef.current.removeAttribute("multiple"); fileRef.current.setAttribute("capture","environment"); fileRef.current.click(); }}
              style={{
                width:"100%", height:140, background:C.shell,
                border:`2px solid ${C.border}`, borderRadius:4,
                ...fl("column","center","center",10),
                cursor:"pointer", marginBottom:10,
              }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#CFB586" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span style={{fontSize:13,color:"#CFB586",fontWeight:600}}>Take a Photo</span>
              <span style={{fontSize:10,color:"#9C9F88"}}>Opens camera</span>
            </button>

            {/* Gallery button -- supports selecting multiple photos at once */}
            <button
              onClick={()=>{ fileRef.current.removeAttribute("capture"); fileRef.current.setAttribute("multiple","multiple"); fileRef.current.click(); }}
              style={{
                width:"100%", height:80, background:C.surface,
                border:`1px solid ${C.border}`, borderRadius:4,
                ...fl("row","center","center",12),
                cursor:"pointer", marginBottom:18,
              }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.olive} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              <div>
                <div style={{fontSize:13,color:C.sand,fontWeight:600}}>Choose from Gallery</div>
                <div style={{fontSize:9,color:C.dust,marginTop:1}}>Select multiple photos at once</div>
              </div>
            </button>

            {loading && (
              <div style={{textAlign:"center",padding:"20px 0",fontSize:12,color:C.dust}}>
                Loading image{staged.length!==1?"s":""}...
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Thumbnail strip of all staged images */}
            <SectionLabel style={{marginBottom:8}}>
              {staged.length} Photo{staged.length>1?"s":""} Selected
            </SectionLabel>
            <div style={{
              display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:14,
            }}>
              {staged.map((s,i)=>(
                <div key={i} style={{position:"relative",flexShrink:0,width:90,height:90,borderRadius:4,overflow:"hidden",background:C.surface}}>
                  <img src={s.dataUrl} alt={s.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                  <button
                    onClick={()=>removeStaged(i)}
                    style={{
                      position:"absolute",top:4,right:4,
                      background:"rgba(0,0,0,0.6)",border:"none",borderRadius:"50%",
                      width:20,height:20,...fl("row","center","center"),cursor:"pointer",
                    }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
              {/* Add more tile */}
              <button
                onClick={()=>{ fileRef.current.removeAttribute("capture"); fileRef.current.setAttribute("multiple","multiple"); fileRef.current.click(); }}
                style={{
                  flexShrink:0,width:90,height:90,borderRadius:4,
                  border:`1.5px dashed ${C.border}`,background:"none",cursor:"pointer",
                  ...fl("column","center","center",4),
                }}>
                <Icon name="plus" size={18} color={C.dust}/>
                <span style={{fontSize:9,color:C.dust,fontWeight:600}}>Add More</span>
              </button>
            </div>

            {/* Caption input */}
            <div style={{marginBottom:18}}>
              <SectionLabel style={{marginBottom:5}}>
                Caption {staged.length>1 ? "(applies to all)" : ""}
              </SectionLabel>
              <input
                value={caption}
                onChange={e=>setCaption(e.target.value)}
                placeholder="What's happening in this shot?"
                style={inp}
                autoFocus
              />
            </div>

            <div style={{...fl("row","center","flex-start",10)}}>
              <Btn variant="primary" onClick={publish} style={{flex:1,padding:"12px"}}>
                {staged.length>1 ? `Share ${staged.length} Photos with Camp` : "Share with Camp"}
              </Btn>
              <Btn variant="ghost" small onClick={()=>setStaged([])}>
                Clear
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // -- Gallery grid --------------------------------------------
  return (
    <div style={{paddingBottom:24}}>
      <div style={{padding:"14px 16px 12px",...fl("row","center","space-between")}}>
        <SectionLabel style={{margin:0}}>{photos.length} Photos</SectionLabel>
        <Btn variant="surface" small onClick={()=>setAddMode(true)}>+ Add Photo</Btn>
      </div>

      {photos.length === 0 ? (
        <div style={{padding:"40px 24px",textAlign:"center"}}>
          <Icon name="photo" size={48} color={C.border}/>
          <div style={{fontFamily:FD,fontSize:16,color:C.sand,marginTop:14,marginBottom:6}}>No photos yet</div>
          <div style={{fontSize:12,color:C.dust,marginBottom:20}}>Be the first to share a shot from camp</div>
          <Btn variant="primary" onClick={()=>setAddMode(true)}>Add the First Photo</Btn>
        </div>
      ) : (
        <>
          {/* Hero -- first photo */}
          <button onClick={()=>setPreview(photos[0])} style={{
            display:"block",width:"100%",border:"none",cursor:"pointer",
            padding:0,position:"relative",height:230,overflow:"hidden",
            background:C.surface,marginBottom:2,
          }}>
            {photos[0].url
              ? <img src={photos[0].url} alt={photos[0].caption} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
              : <div style={{width:"100%",height:"100%",...fl("column","center","center")}}><Icon name="photo" size={32} color={C.border}/></div>
            }
            <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 40%,rgba(0,0,0,0.62))"}}/>
            <div style={{position:"absolute",bottom:12,left:14,right:70}}>
              {photos[0].caption && <div style={{fontSize:14,color:"#fff",fontWeight:700,fontFamily:FD,lineHeight:1.3,textShadow:"0 1px 4px rgba(0,0,0,0.5)"}}>{photos[0].caption}</div>}
              <div style={{fontSize:10,color:"rgba(255,255,255,0.75)",marginTop:3}}>{photos[0].by.split(" ")[0]} . {photos[0].time}</div>
            </div>
            <div style={{position:"absolute",bottom:12,right:12,...fl("row","center","flex-end",4)}}>
              <Icon name="heart" size={14} color={photos[0].liked?C.olive:"rgba(255,255,255,0.8)"} sw={2}/>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.9)",fontWeight:600}}>{photos[0].likes}</span>
            </div>
          </button>

          {/* 2-column grid */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2}}>
            {photos.slice(1).map(p=>(
              <button key={p.id} onClick={()=>setPreview(p)} style={{
                border:"none",cursor:"pointer",padding:0,
                position:"relative",height:160,overflow:"hidden",
                background:C.lift,display:"block",
              }}>
                {p.url
                  ? <img src={p.url} alt={p.caption} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                  : <div style={{width:"100%",height:"100%",...fl("column","center","center")}}><Icon name="photo" size={20} color={C.border}/></div>
                }
                <div style={{position:"absolute",bottom:0,left:0,right:0,height:60,background:"linear-gradient(transparent,rgba(0,0,0,0.55))"}}/>
                <div style={{position:"absolute",bottom:7,left:9,right:9}}>
                  {p.caption && <div style={{fontSize:10,color:"#fff",fontWeight:500,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textShadow:"0 1px 3px rgba(0,0,0,0.6)"}}>{p.caption}</div>}
                  <div style={{...fl("row","center","space-between"),marginTop:2}}>
                    <span style={{fontSize:9,color:"rgba(255,255,255,0.65)"}}>{p.by.split(" ")[0]}</span>
                    <div style={{...fl("row","center","flex-end",3)}}>
                      <Icon name="heart" size={10} color={p.liked?C.olive:"rgba(255,255,255,0.75)"} sw={2}/>
                      <span style={{fontSize:9,color:"rgba(255,255,255,0.85)",fontWeight:600}}>{p.likes}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
      <Toast msg={toast}/>
    </div>
  );
}
function BillsTab({camp,expenses,setExpenses}) {
  const [sub,setSub]     = useState("expenses");
  const [addMode,setAdd] = useState(false);
  const [settled,setSet] = useState([]);
  const [toast,show]     = useToast();
  const allIds = camp.members.map(m=>m.id);
  const [form,setForm]   = useState({desc:"",amount:"",paidBy:1,split:allIds,cat:"Food"});
  const [paySheet,setPaySheet] = useState(null); // settlement object being paid
  const CATS = ["Transport","Lodge","Food","Hunt","Fuel","Other"];
  const members = camp.members;

  const balances = members.map(m=>{
    let paid=0,share=0;
    expenses.forEach(e=>{if(e.paidBy===m.id)paid+=e.amount;if(e.split.includes(m.id))share+=e.amount/e.split.length;});
    return {...m,paid,share,net:paid-share};
  });
  const calc = () => {
    const dd=balances.filter(x=>x.net<-0.5).map(x=>({...x,rem:-x.net}));
    const cc=balances.filter(x=>x.net>0.5).map(x=>({...x,rem:x.net}));
    const out=[];let di=0,ci=0;
    while(di<dd.length&&ci<cc.length){
      const a=Math.min(dd[di].rem,cc[ci].rem);
      if(a>0.5)out.push({fromId:dd[di].id,from:dd[di].name,toId:cc[ci].id,to:cc[ci].name,amount:Math.round(a)});
      dd[di].rem-=a;cc[ci].rem-=a;
      if(dd[di].rem<0.5)di++;if(cc[ci].rem<0.5)ci++;
    }
    return out;
  };
  const settlements = calc();
  const total = expenses.reduce((s,e)=>s+e.amount,0);
  const myBal = balances.find(m=>m.you);

  const addExpense=()=>{
    if(!form.desc||!form.amount)return;
    setExpenses(ex=>[...ex,{id:Date.now(),desc:form.desc,amount:parseFloat(form.amount),paidBy:form.paidBy,split:form.split,date:"Now",cat:form.cat}]);
    setForm({desc:"",amount:"",paidBy:1,split:allIds,cat:"Food"});setAdd(false);show("Expense added");
  };
  const toggleSplit=id=>setForm(f=>({...f,split:f.split.includes(id)?f.split.filter(x=>x!==id):[...f.split,id]}));

  const MemberPicker = ({label,activeId,onPick}) => (
    <div style={{marginBottom:14}}>
      <SectionLabel style={{marginBottom:6}}>{label}</SectionLabel>
      <Card>{members.map((m,i)=>(
        <div key={m.id}>
          <button onClick={()=>onPick(m.id)} style={{width:"100%",padding:"10px 14px",background:activeId===m.id?C.olivePale:"transparent",border:"none",cursor:"pointer",...fl("row","center","space-between")}}>
            <div style={{...fl("row","center","flex-start",10)}}><InitialAvatar name={m.name} size={30} accent={activeId===m.id} photo={m.photo||null}/><span style={{fontSize:12,color:activeId===m.id?C.sand:C.canvas,fontWeight:activeId===m.id?600:400}}>{m.you?"You":m.name.split(" ")[0]}</span></div>
            {activeId===m.id&&<Icon name="check" size={14} color={C.olive} sw={2}/>}
          </button>
          {i<members.length-1&&<Rule/>}
        </div>
      ))}</Card>
    </div>
  );

  const SplitPicker = () => (
    <div style={{marginBottom:14}}>
      <SectionLabel style={{marginBottom:6}}>Split Between</SectionLabel>
      <Card>{members.map((m,i)=>{
        const inc=form.split.includes(m.id);
        return (
          <div key={m.id}>
            <button onClick={()=>toggleSplit(m.id)} style={{width:"100%",padding:"10px 14px",background:inc?C.olivePale:"transparent",border:"none",cursor:"pointer",...fl("row","center","space-between")}}>
              <div style={{...fl("row","center","flex-start",10)}}><InitialAvatar name={m.name} size={30} accent={inc} photo={m.photo||null}/><span style={{fontSize:12,color:inc?C.sand:C.canvas,fontWeight:inc?600:400}}>{m.you?"You":m.name.split(" ")[0]}</span></div>
              {inc&&<Icon name="check" size={14} color={C.olive} sw={2}/>}
            </button>
            {i<members.length-1&&<Rule/>}
          </div>
        );
      })}</Card>
      {form.amount&&form.split.length>0&&<div style={{marginTop:8,padding:"8px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:2}}>
        <span style={{fontSize:11,color:C.dust}}>Per person: </span>
        <span style={{fontWeight:700,color:C.oliveLt,fontSize:12}}>R {(parseFloat(form.amount||0)/form.split.length).toFixed(0)}</span>
      </div>}
    </div>
  );

  if (addMode) return (
    <div style={{background:C.base,minHeight:"100%"}}>
      <BackBar label="Add Expense" onBack={()=>setAdd(false)}/>
      <div style={{padding:"20px 16px 32px"}}>
        <div style={{marginBottom:14}}><SectionLabel style={{marginBottom:5}}>Description</SectionLabel><input value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder="e.g. Braai supplies" style={inp}/></div>
        <div style={{marginBottom:14}}><SectionLabel style={{marginBottom:5}}>Amount (ZAR)</SectionLabel><input value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="0.00" type="number" style={inp}/></div>
        <div style={{marginBottom:14}}>
          <SectionLabel style={{marginBottom:6}}>Category</SectionLabel>
          <div style={{...fl("row","center","flex-start",8),flexWrap:"wrap"}}>
            {CATS.map(c=>(
              <button key={c} onClick={()=>setForm(f=>({...f,cat:c}))} style={{padding:"5px 13px",borderRadius:2,border:`1px solid ${form.cat===c?C.olive:C.border}`,background:form.cat===c?C.olivePale:C.surface,color:form.cat===c?C.oliveLt:C.dust,fontSize:10,fontWeight:600,cursor:"pointer",letterSpacing:"0.06em",marginBottom:6}}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <MemberPicker label="Paid By" activeId={form.paidBy} onPick={id=>setForm(f=>({...f,paidBy:id}))}/>
        <SplitPicker/>
        <Btn variant="primary" full disabled={!form.desc||!form.amount||!form.split.length} onClick={addExpense} style={{padding:"12px"}}>Add Expense</Btn>
      </div>
    </div>
  );

  return (
    <>
    <div style={{background:C.base,minHeight:"100%"}}>
      {/* Balance strip */}
      <div style={{background:C.shell,padding:"13px 16px",borderBottom:`1px solid #5A2E14`,...fl("row","center","space-between")}}>
        {[{l:"You're Owed",v:`R ${Math.max(0,Math.round(myBal?.net||0)).toLocaleString()}`,c:"#5A7A3A"},
          {l:"You Owe",    v:`R ${Math.max(0,Math.round(-(myBal?.net||0))).toLocaleString()}`,c:"#A4623E"},
          {l:"Camp Total", v:`R ${total.toLocaleString()}`,c:"#CFB586"}].map(s=>(
          <div key={s.l} style={{textAlign:"center"}}>
            <div style={{fontFamily:FD,fontSize:17,fontWeight:700,color:s.c}}>{s.v}</div>
            <div style={{fontSize:9,color:"#9C9F88",textTransform:"uppercase",letterSpacing:"0.08em",marginTop:1}}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* Sub tabs */}
      <div style={{...fl("row","center","flex-start"),background:C.shell,borderBottom:`1px solid #5A2E14`}}>
        {[["expenses","Expenses"],["balances","Balances"],["settle","Settle Up"]].map(([k,l])=>(
          <button key={k} onClick={()=>setSub(k)} style={{flex:1,padding:"10px 0",background:"none",border:"none",borderBottom:`2px solid ${sub===k?"#9C9F88":"transparent"}`,color:sub===k?"#F2EDDE":"#9C9F88",fontSize:10,fontWeight:700,cursor:"pointer",letterSpacing:"0.1em",textTransform:"uppercase"}}>{l}</button>
        ))}
      </div>
      <div style={{padding:"14px 16px 24px"}}>
        {sub==="expenses"&&<>
          <div style={{...fl("row","center","space-between"),marginBottom:12}}>
            <SectionLabel style={{margin:0}}>{expenses.length} items . R {total.toLocaleString()}</SectionLabel>
            <Btn variant="surface" small onClick={()=>setAdd(true)}>Add</Btn>
          </div>
          <Card>{expenses.map((e,i)=>{
            const payer=members.find(m=>m.id===e.paidBy);
            return (
              <div key={e.id}>
                <div style={{padding:"12px 14px"}}>
                  <div style={{...fl("row","center","space-between"),marginBottom:4}}>
                    <span style={{fontSize:13,color:C.sand,fontWeight:500,flex:1,paddingRight:8,lineHeight:1.3}}>{e.desc}</span>
                    <span style={{fontFamily:FD,fontSize:15,fontWeight:700,color:C.khaki,flexShrink:0}}>R {e.amount.toLocaleString()}</span>
                  </div>
                  <div style={{...fl("row","center","flex-start",0),flexWrap:"wrap",gap:8}}>
                    <span style={{fontSize:10,color:C.dust}}>{e.cat}</span>
                    <span style={{fontSize:10,color:C.dust}}>.</span>
                    <span style={{fontSize:10,color:C.dust}}>Paid by {payer?.you?"you":payer?.name.split(" ")[0]}</span>
                    <span style={{fontSize:10,color:C.dust}}>.</span>
                    <span style={{fontSize:10,color:C.dust}}>R{(e.amount/e.split.length).toFixed(0)}/person</span>
                  </div>
                </div>
                {i<expenses.length-1&&<Rule/>}
              </div>
            );
          })}</Card>
        </>}
        {sub==="balances"&&<>
          <p style={{fontSize:11,color:C.dust,marginBottom:12,lineHeight:1.6}}>Net position after all shared expenses.</p>
          <Card>{balances.map((b,i)=>(
            <div key={b.id}>
              <div style={{padding:"12px 14px",...fl("row","center","space-between")}}>
                <div style={{...fl("row","center","flex-start",10)}}>
                  <InitialAvatar name={b.name} size={36} accent={b.you}/>
                  <div>
                    <div style={{fontSize:12,color:b.you?C.oliveLt:C.sand,fontWeight:b.you?600:400}}>{b.you?"You":b.name}</div>
                    <div style={{fontSize:10,color:C.dust,marginTop:1}}>Paid R{Math.round(b.paid).toLocaleString()} . Owes R{Math.round(b.share).toLocaleString()}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:FD,fontSize:16,fontWeight:700,color:b.net>=0?C.green:C.red}}>
                    {b.net>=0?"+":"-"}R{Math.abs(Math.round(b.net)).toLocaleString()}
                  </div>
                  <div style={{fontSize:9,color:b.net>=0?C.green:C.red,textTransform:"uppercase",letterSpacing:"0.06em"}}>{b.net>=0?"Is owed":"Owes"}</div>
                </div>
              </div>
              {i<balances.length-1&&<Rule/>}
            </div>
          ))}</Card>
        </>}
        {sub==="settle"&&<>
          <p style={{fontSize:11,color:C.dust,marginBottom:12,lineHeight:1.6}}>Minimum transactions to clear all balances.</p>
          {settlements.length===0?(
            <Card style={{padding:"28px",textAlign:"center"}}>
              <Icon name="check" size={28} color={C.green} sw={1.5}/>
              <div style={{fontFamily:FD,fontSize:15,color:C.sand,marginTop:10}}>All settled</div>
              <div style={{fontSize:12,color:C.dust,marginTop:4}}>No outstanding balances.</div>
            </Card>
          ):(
            settlements.map((s,i)=>{
              const key=`${s.fromId}-${s.toId}`;const done=settled.includes(key);
              const toMember = members.find(m=>m.id===s.toId);
              const hasBanking = !!toMember?.banking;
              const isYourDebt = members.find(m=>m.id===s.fromId)?.you;
              return (
                <Card key={i} style={{marginBottom:10,opacity:done?0.45:1}}>
                  <div style={{padding:"14px 14px 10px",...fl("row","center","space-between")}}>
                    <div style={{...fl("row","center","flex-start",10)}}>
                      <InitialAvatar name={s.from} size={36}/>
                      <div><div style={{fontSize:12,color:C.sand,fontWeight:500}}>{s.from.split(" ")[0]}</div><div style={{fontSize:10,color:C.dust}}>pays</div></div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontFamily:FD,fontSize:18,fontWeight:700,color:C.khaki}}>R {s.amount.toLocaleString()}</div>
                      <Icon name="chevR" size={14} color={C.dust}/>
                    </div>
                    <div style={{...fl("row","center","flex-end",10)}}>
                      <div style={{textAlign:"right"}}><div style={{fontSize:12,color:C.sand,fontWeight:500}}>{s.to.split(" ")[0]}</div><div style={{fontSize:10,color:C.dust}}>receives</div></div>
                      <InitialAvatar name={s.to} size={36}/>
                    </div>
                  </div>
                  <Rule/>
                  <div style={{padding:"10px 14px"}}>
                    {done ? (
                      <div style={{textAlign:"center",fontSize:11,color:C.green,fontWeight:700,letterSpacing:"0.1em"}}>PAID</div>
                    ) : isYourDebt ? (
                      <Btn variant="primary" full small onClick={()=>setPaySheet({...s,key,hasBanking,toMember,isYourDebt})}>
                        Pay Now -- R {s.amount.toLocaleString()}
                      </Btn>
                    ) : (
                      <div style={{
                        ...fl("row","center","center",6),
                        padding:"10px 0",background:C.base,borderRadius:3,
                        border:`1px solid ${C.border}`,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.dust} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                        </svg>
                        <span style={{fontSize:10.5,color:C.dust,fontWeight:600,letterSpacing:"0.04em"}}>
                          Awaiting payment from {s.from.split(" ")[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </>}
      </div>
      <Toast msg={toast}/>
    </div>

    {paySheet && (
      <PaySheet
        settlement={paySheet}
        onClose={()=>setPaySheet(null)}
        onConfirm={()=>{
          setSet(ss=>[...ss,paySheet.key]);
          setPaySheet(null);
          show(`R ${paySheet.amount.toLocaleString()} paid to ${paySheet.to.split(" ")[0]}`);
        }}
      />
    )}
    </>
  );
}

// =============================================================================
//  PAY SHEET -- in-app settlement payment confirmation
// =============================================================================
function PaySheet({settlement, onClose, onConfirm}) {
  const [step, setStep] = useState("review"); // review -> processing -> done
  const s = settlement;
  const b = s.toMember?.banking;

  // Defense in depth: this sheet must only ever confirm a payment that the
  // current device's "you" member is the one responsible for paying.
  // The settlement object only reaches here via the isYourDebt-gated button,
  // but we re-check before allowing confirmation regardless.
  const authorized = s.isYourDebt !== false;

  const maskAcc = num => num ? `${"*".repeat(Math.max(0,num.length-4))}${num.slice(-4)}` : "";

  const confirmPay = () => {
    if (!authorized) return;
    setStep("processing");
    setTimeout(() => {
      setStep("done");
      setTimeout(() => onConfirm(), 1100);
    }, 1400);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(10,5,2,0.6)",zIndex:160,display:"flex",alignItems:"flex-end"}}>
      <div style={{
        width:"100%",background:C.base,borderRadius:"16px 16px 0 0",
        padding:"10px 20px 28px",maxHeight:"86vh",overflowY:"auto",
        boxShadow:"0 -8px 32px rgba(0,0,0,0.4)",
      }}>
        {/* Drag handle */}
        <div style={{width:36,height:4,background:C.border,borderRadius:2,margin:"0 auto 18px"}}/>

        {step === "review" && (
          <>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:10,color:C.dust,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:6}}>Settle Up</div>
              <div style={{fontFamily:FD,fontSize:30,fontWeight:700,color:C.sand}}>R {s.amount.toLocaleString()}</div>
              <div style={{fontSize:12,color:C.dust,marginTop:4}}>to {s.to.split(" ")[0]}</div>
            </div>

            {b ? (
              <Card style={{marginBottom:16}}>
                <div style={{padding:"10px 14px",background:C.olivePale,...fl("row","center","flex-start",6),borderBottom:`1px solid ${C.border}`}}>
                  <Icon name="wallet" size={13} color={C.olive}/>
                  <span style={{fontSize:10,color:C.olive,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>Recipient's Banking Details</span>
                </div>
                <div style={{padding:"12px 14px",...fl("row","center","space-between"),borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:11,color:C.dust}}>Account Holder</span>
                  <span style={{fontSize:12,color:C.sand,fontWeight:600}}>{b.accountHolder}</span>
                </div>
                <div style={{padding:"12px 14px",...fl("row","center","space-between"),borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:11,color:C.dust}}>Bank</span>
                  <span style={{fontSize:12,color:C.sand,fontWeight:600}}>{b.bank}</span>
                </div>
                <div style={{padding:"12px 14px",...fl("row","center","space-between"),borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:11,color:C.dust}}>Account Number</span>
                  <span style={{fontSize:12,color:C.sand,fontWeight:600,fontFamily:"monospace",letterSpacing:"0.04em"}}>{maskAcc(b.accountNumber)}</span>
                </div>
                <div style={{padding:"12px 14px",...fl("row","center","space-between")}}>
                  <span style={{fontSize:11,color:C.dust}}>Account Type</span>
                  <span style={{fontSize:12,color:C.sand,fontWeight:600}}>{b.accountType}</span>
                </div>
              </Card>
            ) : (
              <Card style={{padding:"18px",textAlign:"center",marginBottom:16}}>
                <Icon name="wallet" size={20} color={C.border}/>
                <div style={{fontSize:11,color:C.dust,marginTop:8,lineHeight:1.6}}>
                  {s.to.split(" ")[0]} hasn't added banking details yet. You can still mark this as paid manually once you've settled outside the app.
                </div>
              </Card>
            )}

            <div style={{...fl("row","flex-start","flex-start",6),marginBottom:18,padding:"0 4px"}}>
              <Icon name="info" size={11} color={C.dust}/>
              <span style={{fontSize:9.5,color:C.dust,lineHeight:1.5}}>HuntBuddy does not move money between accounts. Confirming records the payment as settled once you've completed the transfer via your banking app.</span>
            </div>

            <Btn variant="primary" full onClick={confirmPay} disabled={!b||!authorized} style={{padding:"13px"}}>
              {b ? `Pay Now -- R ${s.amount.toLocaleString()}` : "Mark as Paid"}
            </Btn>
            <Btn variant="ghost" full small onClick={onClose} style={{marginTop:8}}>Cancel</Btn>
          </>
        )}

        {step === "processing" && (
          <div style={{padding:"40px 0",textAlign:"center"}}>
            <div style={{
              width:40,height:40,borderRadius:"50%",border:`3px solid ${C.border}`,
              borderTopColor:C.olive,margin:"0 auto 16px",
              animation:"spin 0.8s linear infinite",
            }}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{fontSize:13,color:C.dust}}>Confirming payment...</div>
          </div>
        )}

        {step === "done" && (
          <div style={{padding:"40px 0",textAlign:"center"}}>
            <div style={{
              width:52,height:52,borderRadius:"50%",background:"rgba(90,122,58,0.15)",
              border:`2px solid ${C.green}`,margin:"0 auto 16px",
              ...fl("row","center","center"),
            }}>
              <Icon name="check" size={24} color={C.green} sw={2.5}/>
            </div>
            <div style={{fontFamily:FD,fontSize:16,fontWeight:700,color:C.sand}}>Payment Confirmed</div>
            <div style={{fontSize:12,color:C.dust,marginTop:4}}>R {s.amount.toLocaleString()} settled with {s.to.split(" ")[0]}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
//  TAB: SHOT PLACEMENT
// =============================================================================

// =============================================================================
//  TAB: GPS TRACKER
// =============================================================================

// Simulated member positions on a farm map (% coordinates on the canvas)
// Each position drifts slightly each tick to simulate real movement
// =============================================================================
//  PTT BUTTON -- Walkie-talkie Push-to-Talk
// =============================================================================
function PTTButton({members}) {
  const [state, setState] = useState("idle"); // idle | transmitting | receiving
  const [speaker, setSpeaker] = useState(null);
  const [wave, setWave] = useState(0);
  const timerRef = useRef(null);
  const waveRef  = useRef(null);

  // Animate waveform when transmitting
  useEffect(() => {
    if (state === "transmitting") {
      waveRef.current = setInterval(() => setWave(w => (w + 1) % 8), 120);
    } else {
      clearInterval(waveRef.current);
      setWave(0);
    }
    return () => clearInterval(waveRef.current);
  }, [state]);

  const startTalk = () => {
    clearTimeout(timerRef.current);
    setState("transmitting");
    setSpeaker(null);
  };

  const stopTalk = () => {
    setState("idle");
    // Simulate another member responding after a short delay
    timerRef.current = setTimeout(() => {
      const others = members.filter(m => !m.you);
      if (others.length > 0) {
        const responder = others[Math.floor(Math.random() * others.length)];
        setSpeaker(responder.name.split(" ")[0]);
        setState("receiving");
        setTimeout(() => { setState("idle"); setSpeaker(null); }, 2800);
      }
    }, 600);
  };

  const idle         = state === "idle";
  const transmitting = state === "transmitting";
  const receiving    = state === "receiving";

  // Sound wave bars
  const bars = [3,6,9,12,9,6,3,5];

  return (
    <div style={{...fl("column","center","center",0),width:"100%"}}>

      {/* Status bar */}
      <div style={{
        width:"100%", marginBottom:20,
        background: transmitting ? "#1A3A1A" : receiving ? "#1A2A3A" : C.shell,
        border:`1px solid ${transmitting?"#3A7A3A":receiving?"#2A5A8A":C.borderLt}`,
        borderRadius:4, padding:"8px 14px",
        ...fl("row","center","space-between"),
        minHeight:38,
      }}>
        {transmitting && (
          <>
            <div style={{...fl("row","center","flex-start",8)}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#5ACA5A",animation:"none"}}/>
              <span style={{fontSize:11,color:"#5ACA5A",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Transmitting</span>
            </div>
            {/* Animated sound bars */}
            <div style={{...fl("row","flex-end","flex-end",3),height:20}}>
              {bars.map((h,i)=>(
                <div key={i} style={{
                  width:3, borderRadius:2,
                  background:"#5ACA5A",
                  height: wave===i||wave===(i+1)%8 ? h+6 : h,
                  transition:"height 0.1s",
                  opacity: 0.7 + (wave===i?0.3:0),
                }}/>
              ))}
            </div>
          </>
        )}
        {receiving && (
          <>
            <div style={{...fl("row","center","flex-start",8)}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#5A8ACA"}}/>
              <span style={{fontSize:11,color:"#5A8ACA",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>
                {speaker} is talking...
              </span>
            </div>
            <div style={{...fl("row","flex-end","flex-end",3),height:20}}>
              {bars.map((h,i)=>(
                <div key={i} style={{width:3,borderRadius:2,background:"#5A8ACA",height:h,opacity:0.8}}/>
              ))}
            </div>
          </>
        )}
        {idle && (
          <span style={{fontSize:11,color:C.dust,letterSpacing:"0.08em"}}>Channel clear -- hold button to transmit</span>
        )}
      </div>

      {/* The walkie-talkie PTT button body */}
      <div style={{
        width:200, borderRadius:16,
        background:"linear-gradient(180deg,#2A2A2A 0%,#1A1A1A 100%)",
        border:"3px solid #3A3A3A",
        padding:"18px 16px 20px",
        boxShadow:"0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
        ...fl("column","center","center",0),
        userSelect:"none",
      }}>
        {/* Speaker grille */}
        <div style={{
          width:160, height:40, borderRadius:4,
          background:"#111", border:"1px solid #333",
          marginBottom:14,
          ...fl("row","center","center",3),
          flexWrap:"wrap", gap:3, padding:"8px 10px",
          overflow:"hidden",
        }}>
          {Array.from({length:35}).map((_,i)=>(
            <div key={i} style={{
              width:3, height:3, borderRadius:"50%",
              background: receiving ? (i%3===0?"#5A8ACA":"#2A2A2A") : "#222",
              transition:"background 0.15s",
            }}/>
          ))}
        </div>

        {/* Channel indicator */}
        <div style={{
          width:160,background:"#0A0A0A",borderRadius:3,
          border:"1px solid #2A2A2A",padding:"4px 10px",
          marginBottom:14,...fl("row","center","space-between"),
        }}>
          <span style={{fontSize:9,color:"#5A5A5A",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>CH</span>
          <span style={{fontFamily:FD,fontSize:18,color:"#A4623E",fontWeight:700,letterSpacing:"0.08em"}}>01</span>
          <span style={{fontSize:9,color:"#5A5A5A"}}>CAMP</span>
        </div>

        {/* The PTT button */}
        <button
          onMouseDown={startTalk} onMouseUp={stopTalk} onMouseLeave={()=>{if(transmitting)stopTalk();}}
          onTouchStart={e=>{e.preventDefault();startTalk();}}
          onTouchEnd={e=>{e.preventDefault();stopTalk();}}
          onTouchCancel={e=>{e.preventDefault();stopTalk();}}
          onContextMenu={e=>e.preventDefault()}
          disabled={receiving}
          style={{
            width:160, height:88, borderRadius:8,
            background: transmitting
              ? "linear-gradient(180deg,#2A6A2A 0%,#1A4A1A 100%)"
              : receiving
              ? "linear-gradient(180deg,#1A2A3A 0%,#0A1A2A 100%)"
              : "linear-gradient(180deg,#8A1A1A 0%,#5A0A0A 100%)",
            border: transmitting
              ? "3px solid #5ACA5A"
              : receiving
              ? "3px solid #5A8ACA"
              : "3px solid #C03030",
            boxShadow: transmitting
              ? "0 0 16px rgba(90,202,90,0.5), 0 4px 8px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)"
              : "0 4px 8px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.05)",
            cursor: receiving ? "not-allowed" : "pointer",
            ...fl("column","center","center",6),
            transition:"all 0.12s",
            transform: transmitting ? "translateY(2px)" : "translateY(0)",
            WebkitTapHighlightColor:"transparent",
            WebkitTouchCallout:"none",
            userSelect:"none",
            WebkitUserSelect:"none",
            touchAction:"none",
            outline:"none",
          }}>
          {/* Mic icon */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke={transmitting?"#5ACA5A":receiving?"#5A8ACA":"rgba(255,255,255,0.7)"}
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
            <path d="M19 10v2a7 7 0 01-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
          <span style={{
            fontSize:10, fontWeight:700, letterSpacing:"0.12em",
            textTransform:"uppercase",
            color: transmitting ? "#5ACA5A" : receiving ? "#5A8ACA" : "rgba(255,255,255,0.75)",
          }}>
            {transmitting ? "Transmitting" : receiving ? "Receiving" : "Push to Talk"}
          </span>
        </button>

        {/* Bottom indicator LEDs */}
        <div style={{...fl("row","center","center",8),marginTop:14}}>
          {[
            {color: transmitting?"#5ACA5A":"#1A3A1A", label:"TX"},
            {color: receiving?"#5A8ACA":"#1A2A3A",   label:"RX"},
            {color:"#3A2A0A",                         label:"SQ"},
          ].map(led=>(
            <div key={led.label} style={{...fl("column","center","center",3)}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:led.color,boxShadow:`0 0 ${led.color!=="3A2A0A"?"6px":"0"} ${led.color}`}}/>
              <span style={{fontSize:7,color:"#4A4A4A",fontWeight:700,letterSpacing:"0.08em"}}>{led.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Instruction label */}
      <div style={{marginTop:16,textAlign:"center"}}>
        <span style={{
          fontSize:11,color:C.dust,letterSpacing:"0.06em",
          fontStyle:"italic",
        }}>
          {transmitting ? "Release to stop transmitting" : receiving ? `Receiving from ${speaker}...` : "Hold to talk, release to listen"}
        </span>
      </div>
    </div>
  );
}

// =============================================================================
//  COMPACT PTT -- landscape strip that fits below the map
// =============================================================================
function CompactPTT({members, onMessage}) {
  const [state, setState]   = useState("idle");
  const [speaker, setSpeaker] = useState(null);
  const [wave, setWave]     = useState(0);
  const timerRef = useRef(null);
  const waveRef  = useRef(null);
  const txStartRef = useRef(null);

  useEffect(() => {
    if (state === "transmitting") {
      waveRef.current = setInterval(() => setWave(w => (w + 1) % 6), 130);
    } else {
      clearInterval(waveRef.current); setWave(0);
    }
    return () => clearInterval(waveRef.current);
  }, [state]);

  const startTalk = () => { clearTimeout(timerRef.current); setState("transmitting"); setSpeaker(null); txStartRef.current = Date.now(); };
  const stopTalk  = () => {
    setState("idle");
    // Log your own transmission to history
    if (txStartRef.current && onMessage) {
      const dur = Math.max(1, Math.round((Date.now() - txStartRef.current) / 1000));
      onMessage({ by: "You", you: true, duration: dur, time: new Date() });
    }
    timerRef.current = setTimeout(() => {
      const others = members.filter(m => !m.you);
      if (others.length > 0) {
        const r = others[Math.floor(Math.random() * others.length)];
        const dur = 2 + Math.floor(Math.random()*4);
        setSpeaker(r.name.split(" ")[0]);
        setState("receiving");
        setTimeout(() => {
          setState("idle");
          setSpeaker(null);
          if (onMessage) onMessage({ by: r.name.split(" ")[0], you: false, duration: dur, time: new Date() });
        }, 2800);
      }
    }, 500);
  };

  const tx = state === "transmitting";
  const rx = state === "receiving";
  const waveBars = [4,8,12,10,7,4];

  return (
    <div style={{
      background:"#161616",border:"2px solid #2A2A2A",borderRadius:10,
      padding:"10px 12px",
      boxShadow:"0 4px 16px rgba(0,0,0,0.5)",
      ...fl("row","center","space-between",10),
    }}>

      {/* Left: speaker grille + channel */}
      <div style={{...fl("column","center","flex-start",6),flexShrink:0}}>
        {/* Mini speaker grille */}
        <div style={{
          width:48,height:28,borderRadius:3,background:"#0A0A0A",
          border:"1px solid #2A2A2A",
          display:"grid",gridTemplateColumns:"repeat(8,1fr)",
          gap:2,padding:"4px 5px",overflow:"hidden",
        }}>
          {Array.from({length:24}).map((_,i)=>(
            <div key={i} style={{
              width:3,height:3,borderRadius:"50%",
              background: rx ? (i%4===0?"#5A8ACA":"#1A1A1A") : "#1E1E1E",
            }}/>
          ))}
        </div>
        {/* Channel label */}
        <div style={{
          background:"#0A0A0A",borderRadius:2,
          border:"1px solid #222",padding:"2px 6px",
          ...fl("row","center","center",4),
        }}>
          <span style={{fontSize:7,color:"#444",fontWeight:700,letterSpacing:"0.1em"}}>CH</span>
          <span style={{fontFamily:FD,fontSize:14,color:"#A4623E",fontWeight:700}}>01</span>
        </div>
      </div>

      {/* Centre: status + waveform */}
      <div style={{flex:1,minWidth:0,padding:"0 6px"}}>
        <div style={{
          background: tx?"#0A1A0A":rx?"#0A0F1A":"#0A0A0A",
          borderRadius:4,padding:"6px 10px",
          border:`1px solid ${tx?"#2A5A2A":rx?"#2A3A5A":"#1A1A1A"}`,
          marginBottom:6,
          ...fl("row","center","space-between"),
          minHeight:32,
        }}>
          {tx && (<>
            <div style={{...fl("row","center","flex-start",5)}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:"#5ACA5A"}}/>
              <span style={{fontSize:9,color:"#5ACA5A",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>TX</span>
            </div>
            <div style={{...fl("row","flex-end","flex-end",2),height:18}}>
              {waveBars.map((h,i)=>(
                <div key={i} style={{width:3,borderRadius:1,background:"#5ACA5A",height:wave===i?h+5:h,transition:"height 0.1s"}}/>
              ))}
            </div>
          </>)}
          {rx && (<>
            <span style={{fontSize:9,color:"#5A8ACA",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>{speaker} talking...</span>
            <div style={{...fl("row","flex-end","flex-end",2),height:18}}>
              {waveBars.map((h,i)=>(<div key={i} style={{width:3,borderRadius:1,background:"#5A8ACA",height:h}}/>))}
            </div>
          </>)}
          {!tx&&!rx && <span style={{fontSize:9,color:"#3A3A3A",letterSpacing:"0.06em"}}>Channel clear</span>}
        </div>
        {/* LED row */}
        <div style={{...fl("row","center","flex-start",10)}}>
          {[{l:"TX",on:tx,c:"#5ACA5A"},{l:"RX",on:rx,c:"#5A8ACA"},{l:"SQ",on:false,c:"#3A2A0A"}].map(led=>(
            <div key={led.l} style={{...fl("row","center","flex-start",3)}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:led.on?led.c:"#1A1A1A"}}/>
              <span style={{fontSize:7,color:"#3A3A3A",fontWeight:700,letterSpacing:"0.08em"}}>{led.l}</span>
            </div>
          ))}
          <span style={{fontSize:8,color:"#2A2A2A",marginLeft:"auto"}}>{members.length} members</span>
        </div>
      </div>

      {/* Right: PTT button */}
      <button
        onMouseDown={startTalk} onMouseUp={stopTalk} onMouseLeave={()=>{if(tx)stopTalk();}}
        onTouchStart={e=>{e.preventDefault();startTalk();}}
        onTouchEnd={e=>{e.preventDefault();stopTalk();}}
        onTouchCancel={e=>{e.preventDefault();stopTalk();}}
        onContextMenu={e=>e.preventDefault()}
        disabled={rx}
        style={{
          width:72, height:72, borderRadius:8, flexShrink:0,
          background: tx
            ? "linear-gradient(180deg,#2A6A2A,#1A4A1A)"
            : rx ? "linear-gradient(180deg,#1A2A3A,#0A1A2A)"
            : "linear-gradient(180deg,#8A1A1A,#5A0A0A)",
          border:`2px solid ${tx?"#5ACA5A":rx?"#5A8ACA":"#C03030"}`,
          boxShadow: tx
            ? "0 0 12px rgba(90,202,90,0.5),0 3px 6px rgba(0,0,0,0.5)"
            : "0 3px 8px rgba(0,0,0,0.6)",
          cursor: rx ? "not-allowed" : "pointer",
          ...fl("column","center","center",4),
          transform: tx ? "translateY(1px)" : "translateY(0)",
          transition:"all 0.1s",
          WebkitTapHighlightColor:"transparent",
          WebkitTouchCallout:"none",
          userSelect:"none",
          WebkitUserSelect:"none",
          touchAction:"none",
          outline:"none",
        }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={tx?"#5ACA5A":rx?"#5A8ACA":"rgba(255,255,255,0.75)"}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
          <path d="M19 10v2a7 7 0 01-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
        <span style={{
          fontSize:7,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",
          color:tx?"#5ACA5A":rx?"#5A8ACA":"rgba(255,255,255,0.65)",
          lineHeight:1.2,textAlign:"center",
        }}>{tx?"Transmit":rx?"Receive":"Hold\nto Talk"}</span>
      </button>
    </div>
  );
}

const MEMBER_COLORS = ["#A4623E","#5A7A3A","#8B6914","#6B3A8A","#2A6A8A"];

// =============================================================================
//  VOICE HISTORY -- Zello-style playback list of past PTT transmissions
// =============================================================================
function VoiceHistory({messages, members}) {
  const [playingId, setPlayingId] = useState(null);
  const [progress, setProgress]   = useState(0);
  const progRef = useRef(null);

  const togglePlay = msg => {
    if (playingId === msg.id) {
      clearInterval(progRef.current);
      setPlayingId(null);
      setProgress(0);
      return;
    }
    clearInterval(progRef.current);
    setPlayingId(msg.id);
    setProgress(0);
    const totalTicks = msg.duration * 10; // 100ms ticks
    let tick = 0;
    progRef.current = setInterval(() => {
      tick++;
      setProgress(tick / totalTicks);
      if (tick >= totalTicks) {
        clearInterval(progRef.current);
        setPlayingId(null);
        setProgress(0);
      }
    }, 100);
  };

  const colorFor = name => {
    const m = members.find(mm => mm.name.split(" ")[0] === name || (name==="You" && mm.you));
    const idx = members.indexOf(m);
    return MEMBER_COLORS[idx >= 0 ? idx % MEMBER_COLORS.length : 0];
  };

  const relTime = d => {
    const diffSec = Math.round((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec/60)}m ago`;
    return d.toLocaleTimeString("en-ZA",{hour:"2-digit",minute:"2-digit"});
  };

  if (messages.length === 0) {
    return (
      <div style={{padding:"24px 16px",textAlign:"center"}}>
        <Icon name="mic" size={22} color={C.border}/>
        <div style={{fontSize:11,color:C.dust,marginTop:8}}>No voice messages yet</div>
        <div style={{fontSize:10,color:C.border,marginTop:2}}>Transmissions will appear here for playback</div>
      </div>
    );
  }

  const recent = messages.slice().reverse().slice(0, 10);

  return (
    <Card style={{marginTop:0,padding:0,overflow:"hidden"}}>
      <div style={{maxHeight:340,overflowY:"auto"}}>
        {recent.map((msg,i) => {
        const isPlaying = playingId === msg.id;
        const color = colorFor(msg.by);
        return (
          <div key={msg.id}>
            <div style={{padding:"9px 12px",...fl("row","center","flex-start",10)}}>
              {/* Avatar */}
              <div style={{
                width:30,height:30,borderRadius:"50%",flexShrink:0,
                background:msg.you?C.shell:color,
                border:msg.you?`1.5px solid ${C.olive}`:"none",
                ...fl("row","center","center"),
                fontFamily:FD,fontSize:10,fontWeight:700,
                color:msg.you?"#F2EDDE":"#fff",
              }}>
                {msg.by.split(" ").map(n=>n[0]).join("").slice(0,2)}
              </div>

              {/* Play button */}
              <button onClick={()=>togglePlay(msg)} style={{
                width:30,height:30,borderRadius:"50%",flexShrink:0,
                background:isPlaying?C.olive:C.surface,
                border:`1px solid ${isPlaying?C.olive:C.borderLt}`,
                cursor:"pointer",...fl("row","center","center"),
              }}>
                {isPlaying ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#F2EDDE"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill={C.canvas}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                )}
              </button>

              {/* Waveform / progress */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{...fl("row","center","space-between"),marginBottom:3}}>
                  <span style={{fontSize:11,fontWeight:600,color:msg.you?C.oliveLt:C.sand}}>{msg.by}</span>
                  <span style={{fontSize:9,color:C.dust}}>{relTime(msg.time)}</span>
                </div>
                <div style={{position:"relative",height:14,...fl("row","center","flex-start",1.5)}}>
                  {Array.from({length:18}).map((_,bi)=>{
                    const barProgress = bi / 18;
                    const played = isPlaying && barProgress <= progress;
                    const h = 4 + ((bi*37) % 10); // pseudo-random static heights
                    return (
                      <div key={bi} style={{
                        width:2.5,height:h,borderRadius:1,flexShrink:0,
                        background:played ? C.olive : C.borderLt,
                      }}/>
                    );
                  })}
                  <span style={{fontSize:9,color:C.dust,marginLeft:6,flexShrink:0}}>{msg.duration}s</span>
                </div>
              </div>
            </div>
            {i<recent.length-1 && <Rule/>}
          </div>
        );
        })}
      </div>
      {messages.length > 10 && (
        <div style={{padding:"7px 12px",background:C.surface,borderTop:`1px solid ${C.border}`,textAlign:"center"}}>
          <span style={{fontSize:9,color:C.dust,letterSpacing:"0.04em"}}>
            Showing last 10 of {messages.length} -- scroll for more
          </span>
        </div>
      )}
    </Card>
  );
}

function GPSTab({camp}) {
  const [sharing, setSharing] = useState(true);
  const [positions, setPositions] = useState(() =>
    camp.members.map((m,i) => ({
      id:    m.id,
      name:  m.name,
      you:   m.you,
      photo: m.photo||null,
      color: MEMBER_COLORS[i % MEMBER_COLORS.length],
      x:     20 + (i * 15) + Math.random() * 10,
      y:     25 + (i * 10) + Math.random() * 10,
      speed: 0.3 + Math.random() * 0.4,
      dx:    (Math.random() - 0.5) * 0.8,
      dy:    (Math.random() - 0.5) * 0.8,
      lastSeen: "Live",
    }))
  );
  const [selected, setSelected] = useState(null);
  const [kills, setKills] = useState([]); // {id, x, y, label, by, time}
  const [selectedKill, setSelectedKill] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [voiceMessages, setVoiceMessages] = useState([]);
  const logMessage = msg => setVoiceMessages(m => [...m, { id: Date.now(), ...msg }]);
  const canvasRef = useRef(null);
  const tickRef   = useRef(null);
  const mapBoxRef = useRef(null);

  // Animate positions
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setPositions(prev => prev.map(p => {
        if (!sharing && p.you) return p;
        let nx = p.x + p.dx * p.speed;
        let ny = p.y + p.dy * p.speed;
        let ndx = p.dx;
        let ndy = p.dy;
        if (nx < 5 || nx > 90)  ndx = -ndx;
        if (ny < 5 || ny > 88)  ndy = -ndy;
        nx = Math.max(5, Math.min(90, nx));
        ny = Math.max(5, Math.min(88, ny));
        // Occasional direction nudge
        if (Math.random() < 0.04) ndx = (Math.random()-0.5)*0.8;
        if (Math.random() < 0.04) ndy = (Math.random()-0.5)*0.8;
        return {...p, x:nx, y:ny, dx:ndx, dy:ndy};
      }));
    }, 1200);
    return () => clearInterval(tickRef.current);
  }, [sharing]);

  // Draw the farm map on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0,0,W,H);

    // Sky/ground base
    ctx.fillStyle = "#C8D4A0";
    ctx.fillRect(0,0,W,H);

    // Farm boundary fence
    ctx.strokeStyle = "#6B4E28";
    ctx.lineWidth = 2;
    ctx.setLineDash([6,4]);
    ctx.strokeRect(8,8,W-16,H-16);
    ctx.setLineDash([]);

    // Bushveld patches
    const bushPatches = [
      {x:0.12,y:0.15,r:0.07},{x:0.45,y:0.08,r:0.05},
      {x:0.75,y:0.20,r:0.06},{x:0.60,y:0.55,r:0.08},
      {x:0.20,y:0.70,r:0.05},{x:0.85,y:0.65,r:0.06},
      {x:0.35,y:0.85,r:0.04},{x:0.70,y:0.85,r:0.05},
    ];
    bushPatches.forEach(b=>{
      ctx.fillStyle = "#7A9A50";
      ctx.beginPath();
      ctx.ellipse(b.x*W, b.y*H, b.r*W, b.r*H*0.7, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = "#5A7A3A";
      ctx.beginPath();
      ctx.ellipse(b.x*W-4, b.y*H-4, b.r*W*0.6, b.r*H*0.5, 0, 0, Math.PI*2);
      ctx.fill();
    });

    // Dam/waterhole
    ctx.fillStyle = "#4A7A9A";
    ctx.beginPath();
    ctx.ellipse(W*0.50, H*0.38, W*0.07, H*0.05, 0.3, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = "#2A5A7A";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#2A5A7A";
    ctx.font = "bold 8px Inter, sans-serif";
    ctx.fillText("Dam", W*0.47, H*0.37);

    // Farm roads
    ctx.strokeStyle = "#B8906A";
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    // Main track
    ctx.beginPath();
    ctx.moveTo(W*0.10, H*0.50);
    ctx.bezierCurveTo(W*0.30, H*0.45, W*0.50, H*0.55, W*0.90, H*0.50);
    ctx.stroke();
    // Side track
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W*0.50, H*0.50);
    ctx.bezierCurveTo(W*0.52, H*0.30, W*0.48, H*0.20, W*0.50, H*0.10);
    ctx.stroke();

    // Farmhouse/camp marker
    ctx.fillStyle = "#8B4A14";
    ctx.fillRect(W*0.46, H*0.60, W*0.08, H*0.06);
    ctx.fillStyle = "#6B2A0A";
    ctx.beginPath();
    ctx.moveTo(W*0.44, H*0.60);
    ctx.lineTo(W*0.50, H*0.54);
    ctx.lineTo(W*0.56, H*0.60);
    ctx.fill();
    ctx.fillStyle = "#2A1206";
    ctx.font = "bold 9px Inter, sans-serif";
    ctx.fillText("Camp", W*0.455, H*0.72);

    // Compass rose
    const cx2 = W-22, cy2 = 22;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath(); ctx.arc(cx2,cy2,14,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "#C44A4A";
    ctx.font = "bold 9px Inter, sans-serif";
    ctx.fillText("N", cx2-4, cy2-6);
    ctx.fillStyle = "#2A1206";
    ctx.fillText("S", cx2-3, cy2+12);
    ctx.fillText("E", cx2+6, cy2+3);
    ctx.fillText("W", cx2-15, cy2+3);

    // Scale bar
    ctx.fillStyle = "#2A1206";
    ctx.fillRect(10, H-18, 50, 3);
    ctx.font = "8px Inter, sans-serif";
    ctx.fillText("500m", 15, H-6);

  }, []);

  const selMember = positions.find(p=>p.id===selected);

  const dropKillPin = () => {
    const me = positions.find(p=>p.you) || {x:50,y:50};
    const newKill = {
      id: Date.now(),
      x: me.x,
      y: me.y,
      label: `Kill ${kills.length + 1}`,
      by: "You",
      time: new Date().toLocaleTimeString("en-ZA",{hour:"2-digit",minute:"2-digit"}),
    };
    setKills(k => [...k, newKill]);
    setSelectedKill(newKill.id);
  };

  const removeKill = id => { setKills(k => k.filter(x=>x.id!==id)); setSelectedKill(null); };

  return (
    <div style={{background:C.base,minHeight:"100%",paddingBottom:24}}>

      {/* Header */}
      <div style={{background:C.shell,padding:"10px 16px 9px",borderBottom:`1px solid #5A2E14`,...fl("row","center","space-between")}}>
        <div>
          <div style={{fontSize:9,color:"#CFB586",fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:1}}>Live Tracker</div>
          <div style={{fontFamily:FD,fontSize:14,color:"#F2EDDE",fontWeight:700}}>{camp.name}</div>
        </div>
        {/* Sharing toggle */}
        <div style={{...fl("row","center","flex-end",8)}}>
          <div style={{fontSize:10,color:sharing?"#5A7A3A":"#9C9F88",fontWeight:600}}>{sharing?"Sharing":"Hidden"}</div>
          <button onClick={()=>setSharing(s=>!s)} style={{
            width:42,height:24,borderRadius:12,
            background:sharing?"#5A7A3A":"#5A2E14",
            border:"none",cursor:"pointer",padding:0,position:"relative",transition:"background 0.2s",
          }}>
            <div style={{
              width:18,height:18,borderRadius:"50%",background:"#F2EDDE",
              position:"absolute",top:3,
              left:sharing?21:3,
              transition:"left 0.2s",
            }}/>
          </button>
        </div>
      </div>

      {/* Live indicator */}
      <div style={{background:C.surface,padding:"5px 16px",borderBottom:`1px solid ${C.border}`,...fl("row","center","flex-start",6)}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:"#5A7A3A"}}/>
        <span style={{fontSize:10,color:"#5A7A3A",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Live</span>
        <span style={{fontSize:10,color:C.dust,marginLeft:4}}>{camp.members.length} members tracked</span>
        <button
          onClick={dropKillPin}
          style={{
            marginLeft:"auto",background:C.olive,
            border:"none",borderRadius:3,
            padding:"3px 8px",cursor:"pointer",
            ...fl("row","center","flex-start",4),
          }}>
          <Icon name="pin" size={11} color="#F2EDDE"/>
          <span style={{fontSize:9,fontWeight:700,color:"#F2EDDE",letterSpacing:"0.04em",textTransform:"uppercase"}}>
            Mark Kill
          </span>
        </button>
      </div>

      {/* Map canvas — reduced height to fit with PTT on one screen */}
      <div
        ref={mapBoxRef}
        style={{
          position:"relative",width:"100%",height:200,overflow:"hidden",background:"#C8D4A0",
        }}>
        <canvas ref={canvasRef} width={390} height={200} style={{display:"block",width:"100%",height:"100%"}}/>

        {/* Kill markers */}
        {kills.map(k=>(
          <button key={k.id}
            onClick={e=>{e.stopPropagation();setSelectedKill(selectedKill===k.id?null:k.id);}}
            style={{
              position:"absolute",left:`${k.x}%`,top:`${k.y}%`,
              transform:"translate(-50%,-100%)",
              background:"none",border:"none",cursor:"pointer",padding:0,
              ...fl("column","center","center",0),
            }}>
            <svg width="22" height="26" viewBox="0 0 22 26" style={{filter:"drop-shadow(0 2px 3px rgba(0,0,0,0.4))"}}>
              <path d="M11 0C5 0 0 5 0 11c0 7 11 15 11 15s11-8 11-15c0-6-5-11-11-11z" fill="#8A2E1A" stroke="#F2EDDE" strokeWidth="1"/>
              <line x1="11" y1="6" x2="11" y2="16" stroke="#F2EDDE" strokeWidth="1.5"/>
              <line x1="6" y1="11" x2="16" y2="11" stroke="#F2EDDE" strokeWidth="1.5"/>
              <circle cx="11" cy="11" r="2" fill="none" stroke="#F2EDDE" strokeWidth="1.2"/>
            </svg>
          </button>
        ))}

        {/* Member pins overlaid on canvas */}
        {positions.map(p=>(
          <button key={p.id}
            onClick={()=>setSelected(selected===p.id?null:p.id)}
            style={{
              position:"absolute",
              left:`${p.x}%`,top:`${p.y}%`,
              transform:"translate(-50%,-100%)",
              background:"none",border:"none",cursor:"pointer",padding:0,
              zIndex:10,
            }}>
            {/* Pin */}
            <div style={{...fl("column","center","center")}}>
              <div style={{
                width:p.you?34:28,height:p.you?34:28,
                borderRadius:"50%",
                background:p.photo?"transparent":p.color,
                border:`2px solid ${selected===p.id?"#F2EDDE":p.you?"#CFB586":"rgba(255,255,255,0.7)"}`,
                boxShadow:`0 2px 6px rgba(0,0,0,0.4)`,
                overflow:"hidden",
                ...fl("row","center","center"),
                fontFamily:FD,
                fontSize:p.you?11:9,
                color:"#F2EDDE",
                fontWeight:700,
              }}>
                {p.photo
                  ? <img src={p.photo} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                  : p.name.split(" ").map(n=>n[0]).join("").slice(0,2)
                }
              </div>
              {/* Pin tail */}
              <div style={{
                width:0,height:0,
                borderLeft:"4px solid transparent",
                borderRight:"4px solid transparent",
                borderTop:`6px solid ${p.color}`,
              }}/>
              {/* Name label */}
              {(p.you || selected===p.id) && (
                <div style={{
                  background:"rgba(61,30,10,0.85)",
                  color:"#F2EDDE",
                  fontSize:9,fontWeight:700,
                  padding:"2px 6px",borderRadius:2,
                  whiteSpace:"nowrap",marginTop:2,
                  letterSpacing:"0.04em",
                }}>
                  {p.you?"You":p.name.split(" ")[0]}
                </div>
              )}
            </div>
          </button>
        ))}

        {/* Selected member detail bubble */}
        {selMember && !selMember.you && (
          <div style={{
            position:"absolute",bottom:10,left:10,right:10,
            background:"rgba(61,30,10,0.92)",
            borderRadius:4,padding:"10px 12px",
            ...fl("row","center","space-between",10),
            zIndex:20,
          }}>
            <div style={{...fl("row","center","flex-start",8)}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:selMember.photo?"transparent":selMember.color,...fl("row","center","center"),fontSize:10,color:"#F2EDDE",fontWeight:700,flexShrink:0,overflow:"hidden"}}>
                {selMember.photo
                  ? <img src={selMember.photo} alt={selMember.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                  : selMember.name.split(" ").map(n=>n[0]).join("").slice(0,2)
                }
              </div>
              <div>
                <div style={{fontSize:12,color:"#F2EDDE",fontWeight:600}}>{selMember.name}</div>
                <div style={{fontSize:10,color:"#9C9F88",marginTop:1}}>Last update: {selMember.lastSeen}</div>
              </div>
            </div>
            <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer",padding:4}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9C9F88" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}
        {/* Selected kill detail bubble */}
        {selectedKill && kills.find(k=>k.id===selectedKill) && (() => {
          const sk = kills.find(k=>k.id===selectedKill);
          return (
            <div style={{
              position:"absolute",bottom:10,left:10,right:10,
              background:"rgba(138,46,26,0.94)",
              borderRadius:4,padding:"10px 12px",
              ...fl("row","center","space-between",10),
              zIndex:21,
            }}>
              <div style={{...fl("row","center","flex-start",8)}}>
                <Icon name="pin" size={18} color="#F2EDDE"/>
                <div>
                  <div style={{fontSize:12,color:"#F2EDDE",fontWeight:700}}>{sk.label}</div>
                  <div style={{fontSize:10,color:"#E8C4B8",marginTop:1}}>Marked by {sk.by} -- {sk.time}</div>
                </div>
              </div>
              <button onClick={()=>removeKill(sk.id)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:3,cursor:"pointer",padding:"4px 8px"}}>
                <span style={{fontSize:9,color:"#F2EDDE",fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase"}}>Remove</span>
              </button>
            </div>
          );
        })()}
      </div>

      {/* Marked kills list */}
      {kills.length>0 && (
        <div style={{padding:"10px 14px 0"}}>
          <SectionLabel>Marked Kills -- {kills.length}</SectionLabel>
          <Card style={{marginBottom:4}}>
            {kills.map((k,i)=>(
              <div key={k.id}>
                <button
                  onClick={()=>setSelectedKill(selectedKill===k.id?null:k.id)}
                  style={{
                    width:"100%",padding:"8px 12px",background:selectedKill===k.id?C.olivePale:"transparent",
                    border:"none",cursor:"pointer",...fl("row","center","space-between"),
                  }}>
                  <div style={{...fl("row","center","flex-start",8)}}>
                    <Icon name="pin" size={13} color="#8A2E1A"/>
                    <span style={{fontSize:12,color:C.sand,fontWeight:600}}>{k.label}</span>
                  </div>
                  <span style={{fontSize:10,color:C.dust}}>{k.by} -- {k.time}</span>
                </button>
                {i<kills.length-1&&<Rule/>}
              </div>
            ))}
          </Card>
        </div>
      )}
      <div style={{padding:"12px 14px 16px"}}>

        {/* Status bar */}
        <CompactPTT members={camp.members} onMessage={logMessage}/>

        {/* History toggle tab */}
        <button
          onClick={()=>setShowHistory(h=>!h)}
          style={{
            width:"100%",marginTop:10,background:showHistory?C.olivePale:C.surface,
            border:`1px solid ${showHistory?C.olive:C.borderLt}`,borderRadius:6,
            padding:"9px 12px",cursor:"pointer",
            ...fl("row","center","space-between"),
          }}>
          <div style={{...fl("row","center","flex-start",7)}}>
            <Icon name="mic" size={13} color={showHistory?C.olive:C.canvas}/>
            <span style={{fontSize:11,fontWeight:700,color:showHistory?C.olive:C.canvas,letterSpacing:"0.04em",textTransform:"uppercase"}}>
              Voice History
            </span>
            {voiceMessages.length>0 && (
              <span style={{
                background:showHistory?C.olive:C.borderLt,color:showHistory?"#F2EDDE":C.canvas,
                fontSize:9,fontWeight:700,borderRadius:8,padding:"1px 6px",
              }}>{voiceMessages.length}</span>
            )}
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={showHistory?C.olive:C.dust} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{transform:showHistory?"rotate(180deg)":"none",transition:"transform 0.2s"}}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {showHistory && (
          <div style={{marginTop:8}}>
            <VoiceHistory messages={voiceMessages} members={camp.members}/>
          </div>
        )}
      </div>
    </div>
  );
}


// =============================================================================
//  ROOT
// =============================================================================
export default function App() {
  const [screen,setScreen]   = useState("login");
  const [camp,setCamp]       = useState(null);   // no active camp until created/joined
  const [userName,setUserName]       = useState("");
  const [userAvatar,setUserAvatar]   = useState(null);
  const [userBanking,setUserBanking] = useState(null);

  const nav = to => { setScreen(to); document.getElementById("appRoot")?.scrollTo(0,0); };

  const handleLogin = ({avatar,name,banking}={}) => {
    if (avatar)  setUserAvatar(avatar);
    if (name)    setUserName(name);
    if (banking) setUserBanking(banking);
    nav("home");
  };

  const handleCreate = (form,invited) => {
    const inv = CONTACTS.filter(c=>invited.includes(c.id));
    setCamp({
      name:     form.name||"My Camp",
      location: form.location||"",
      dates:    form.dateFrom&&form.dateTo?`${form.dateFrom} - ${form.dateTo}`:"",
      dateFrom: form.dateFrom||"",
      dateTo:   form.dateTo||"",
      desc:     form.desc||"",
      code:     "CAMP"+Math.random().toString(36).slice(2,4).toUpperCase(),
      members:  [{id:1,name:userName||"You",role:"Trip Leader",you:true,photo:userAvatar,banking:userBanking,lastSeen:"now"},...inv.map(c=>({...c,lastSeen:"Not yet joined"}))],
    });
    setScreen("hub");
  };

  const handleJoin = code => {
    setCamp({
      name:     "Camp "+code,
      location: "",
      dates:    "",
      dateFrom: "",
      dateTo:   "",
      desc:     "",
      code:     code,
      members:  [{id:1,name:userName||"You",role:"Member",you:true,photo:userAvatar,banking:userBanking,lastSeen:"now"}],
    });
    setScreen("hub");
  };

  return (
    <div id="appRoot" style={{fontFamily:FB,background:C.base,minHeight:"100vh",maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column",color:C.sand,overflowY:"auto",maxHeight:"100vh"}}>
      {screen==="login" && <LoginScreen onLogin={handleLogin}/>}
      {screen==="home"  && <HomeScreen  nav={nav} camp={camp} userName={userName}/>}
      {screen==="setup" && <SetupScreen nav={nav} onCreate={handleCreate}/>}
      {screen==="join"  && <JoinScreen  nav={nav} onJoin={handleJoin}/>}
      {screen==="hub"   && camp && <HubWrapper  camp={camp} setCamp={setCamp} nav={nav}/>}
    </div>
  );
}