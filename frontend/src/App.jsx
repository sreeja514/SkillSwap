import { useEffect, useMemo, useState } from "react";

const API = "https://skillswap-dt8c.onrender.com/api";
const demoStudents = [
  { id: 101, name: "Aarav Sharma", email: "aarav@example.com", skillsToTeach: "Python, Java, DSA", skillsToLearn: "UI Design, React" },
  { id: 102, name: "Maya Reddy", email: "maya@example.com", skillsToTeach: "UI Design, Figma, Canva", skillsToLearn: "Python, Machine Learning" },
  { id: 103, name: "Rohan Kumar", email: "rohan@example.com", skillsToTeach: "React, JavaScript, CSS", skillsToLearn: "SQL, Data Science" },
  { id: 104, name: "Ananya Rao", email: "ananya@example.com", skillsToTeach: "Machine Learning, SQL", skillsToLearn: "Java, Public Speaking" },
];
const initialForm = { name: "", email: "", password: "", skillsToTeach: "", skillsToLearn: "" };
const splitSkills = (value = "") => value.split(",").map(s => s.trim()).filter(Boolean);
const initials = name => (name || "S").split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase();

function App() {
  const [page, setPage] = useState("Home");
  const [students, setStudents] = useState([]);
  const [current, setCurrent] = useState(() => {
    try { return JSON.parse(localStorage.getItem("skillswap-user")) || null; } catch { return null; }
  });
  const [form, setForm] = useState(initialForm);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState("register");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All skills");
  const [chatPartner, setChatPartner] = useState(demoStudents[0]);
  const [chatText, setChatText] = useState("");
  const [chats, setChats] = useState(() => {
    try { return JSON.parse(localStorage.getItem("skillswap-chats")) || {}; } catch { return {}; }
  });
  const [xp, setXp] = useState(() => Number(localStorage.getItem("skillswap-xp") || 120));
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch(`${API}/students`)
      .then(r => { if (!r.ok) throw new Error("API unavailable"); return r.json(); })
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]));
  }, []);

  useEffect(() => localStorage.setItem("skillswap-chats", JSON.stringify(chats)), [chats]);
  useEffect(() => localStorage.setItem("skillswap-xp", String(xp)), [xp]);

  const allStudents = useMemo(() => {
    const merged = [...students, ...demoStudents];
    const seen = new Set();
    return merged.filter(s => {
      const key = (s.email || s.name || "").toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key); return true;
    }).filter(s => !current || s.email !== current.email);
  }, [students, current]);

  const matches = useMemo(() => allStudents.map(s => {
    const teach = splitSkills(s.skillsToTeach);
    const wants = splitSkills(current?.skillsToLearn);
    const common = teach.filter(skill => wants.some(w => w.toLowerCase() === skill.toLowerCase()));
    return { ...s, common, score: common.length };
  }).filter(s => {
    const text = `${s.name} ${s.skillsToTeach} ${s.skillsToLearn}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesFilter = filter === "All skills" || splitSkills(s.skillsToTeach).some(x => x.toLowerCase() === filter.toLowerCase());
    return matchesSearch && matchesFilter;
  }).sort((a, b) => b.score - a.score), [allStudents, current, search, filter]);

  const skillOptions = useMemo(() => ["All skills", ...new Set(allStudents.flatMap(s => splitSkills(s.skillsToTeach)))], [allStudents]);

  function notify(text) {
    setToast(text);
    setTimeout(() => setToast(""), 2600);
  }

  async function submitAuth(e) {
    e.preventDefault(); setMessage("");
    if (authMode === "register" && form.password !== confirmPassword) {
      setMessage("Your passwords do not match."); return;
    }
    if (form.password.length < 8) { setMessage("Use a password with at least 8 characters."); return; }
    setBusy(true);
    try {
      if (authMode === "register") {
        const res = await fetch(`${API}/students/register`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, skillsToTeach: form.skillsToTeach.trim(), skillsToLearn: form.skillsToLearn.trim() })
        });
        const body = await res.text();
        if (!res.ok) throw new Error(body || "Registration failed");
        const safeUser = { ...form }; delete safeUser.password;
        setCurrent(safeUser); localStorage.setItem("skillswap-user", JSON.stringify(safeUser));
        setPage("Dashboard"); notify("Welcome to SkillSwap! +20 XP");
        setXp(n => n + 20);
      } else {
        // Uses the backend login endpoint included in this project.
        const res = await fetch(`${API}/auth/login`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Invalid email or password.");
        const safeUser = data.student || data;
        delete safeUser.password;
        setCurrent(safeUser); localStorage.setItem("skillswap-user", JSON.stringify(safeUser));
        setPage("Dashboard"); notify("You are signed in!");
      }
    } catch (err) {
      setMessage(err.message || "Could not connect. Check that Spring Boot is running.");
    } finally { setBusy(false); }
  }

  function logout() {
    setCurrent(null); localStorage.removeItem("skillswap-user"); setPage("Home"); setAuthMode("login");
    setForm(initialForm); notify("You have signed out.");
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!chatText.trim()) return;
    const key = chatPartner.email || chatPartner.name;
    setChats(old => ({ ...old, [key]: [...(old[key] || []), { from: current?.name || "You", text: chatText.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }] }));
    setChatText(""); setXp(n => n + 5); notify("+5 XP for connecting!");
  }

  function nav(target) {
    if (["Dashboard", "Discover", "Messages", "Achievements"].includes(target) && !current) {
      setPage("Auth"); setAuthMode("login"); setMessage("Sign in to access your student space."); return;
    }
    setPage(target);
  }

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => setPage("Home")} aria-label="SkillSwap home">
        <span className="brand-mark">⇄</span><span>Skill<span>Swap</span></span>
      </button>
      <nav className="desktop-nav">
        {["Home", "Discover", "How it works"].map(n => <button key={n} className={page === n ? "nav-link active" : "nav-link"} onClick={() => setPage(n)}>{n}</button>)}
      </nav>
      <div className="top-actions">
        {current ? <><button className="avatar-mini" onClick={() => nav("Dashboard")}>{initials(current.name)}</button><button className="btn btn-light small" onClick={logout}>Sign out</button></> :
          <><button className="btn btn-light small" onClick={() => { setPage("Auth"); setAuthMode("login"); setMessage(""); }}>Log in</button><button className="btn btn-primary small" onClick={() => { setPage("Auth"); setAuthMode("register"); setMessage(""); }}>Get started <span>↗</span></button></>}
      </div>
    </header>

    {page === "Home" && <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse-dot"></span> THE STUDENT-POWERED LEARNING COMMUNITY</div>
          <h1>Your skills are<br/>someone's <span className="gradient-text">superpower.</span></h1>
          <p className="hero-sub">Teach what you know. Learn what you love. Meet students who turn sharing knowledge into something powerful.</p>
          <div className="hero-buttons"><button className="btn btn-primary btn-lg" onClick={() => { setPage("Auth"); setAuthMode("register"); }}>Start swapping <span>→</span></button><button className="btn btn-light btn-lg" onClick={() => setPage("How it works")}>Explore how it works</button></div>
          <div className="social-proof"><div className="avatar-stack"><span>AR</span><span>SK</span><span>MP</span><span>+</span></div><div><strong>Learn better, together.</strong><small>Made for curious students everywhere</small></div></div>
        </div>
        <div className="hero-art">
          <div className="orb orb-one"></div><div className="orb orb-two"></div>
          <div className="floating-tag tag-python">⌘ &nbsp; Python <small>CAN TEACH</small></div>
          <div className="floating-tag tag-ml">✦ &nbsp; Machine Learning <small>WANTS TO LEARN</small></div>
          <div className="swap-circle">⇄</div>
          <div className="student-illustration">
            <div className="person person-one"><div className="hair"></div><div className="face">◡</div><div className="body purple-body"></div><div className="laptop">S</div></div>
            <div className="person person-two"><div className="hair"></div><div className="face">◡</div><div className="body blue-body"></div><div className="laptop">✦</div></div>
          </div>
          <div className="mini-note"><span className="note-icon">✦</span><div><strong>Skill match!</strong><small>You found your learning buddy</small></div></div>
        </div>
      </section>
      <section className="trust-strip"><span>BUILT FOR THE NEXT GENERATION</span><div><b>01</b> Learn by sharing</div><div><b>02</b> Grow your network</div><div><b>03</b> Earn as you learn</div></section>
      <section className="section feature-section">
        <div className="section-heading"><span className="eyebrow">WHY SKILLSWAP?</span><h2>Learning feels better <span className="gradient-text">together.</span></h2><p>Small exchanges. Big breakthroughs. A community that grows when you do.</p></div>
        <div className="feature-grid">
          <article className="feature-card"><div className="feature-icon lavender">⌕</div><h3>Find your people</h3><p>Discover students who know what you want to learn and want to learn what you know.</p><span className="card-arrow">↗</span></article>
          <article className="feature-card"><div className="feature-icon mint">⇄</div><h3>Make it mutual</h3><p>Trade knowledge, not money. Every student has something valuable to share.</p><span className="card-arrow">↗</span></article>
          <article className="feature-card"><div className="feature-icon peach">♜</div><h3>Level up</h3><p>Collect XP, celebrate milestones and keep your learning streak alive.</p><span className="card-arrow">↗</span></article>
        </div>
      </section>
      <section className="cta-band"><div><span className="eyebrow">YOUR NEXT SKILL IS ONE HELLO AWAY</span><h2>Ready to swap your way forward?</h2><p>Join the community where everyone has something to teach.</p></div><button className="btn btn-white btn-lg" onClick={() => { setPage("Auth"); setAuthMode("register"); }}>Create free account ↗</button></section>
    </main>}

    {page === "Auth" && <main className="auth-layout">
      <section className="auth-story"><span className="eyebrow">WELCOME TO YOUR LEARNING ERA</span><h1>Good things happen when we <span className="gradient-text">share.</span></h1><p>One student. One skill. One connection that could change everything.</p><div className="auth-benefits"><span>✦ &nbsp; Find your perfect skill match</span><span>✦ &nbsp; Build confidence by teaching</span><span>✦ &nbsp; Make learning feel social</span></div><div className="auth-art-bubble">⇄</div></section>
      <section className="auth-card"><div className="auth-tabs"><button className={authMode === "register" ? "selected" : ""} onClick={() => { setAuthMode("register"); setMessage(""); }}>Create account</button><button className={authMode === "login" ? "selected" : ""} onClick={() => { setAuthMode("login"); setMessage(""); }}>Log in</button></div>
        <h2>{authMode === "register" ? "Join SkillSwap" : "Welcome back!"}</h2><p className="muted">{authMode === "register" ? "Your next learning adventure starts here." : "Pick up where your curiosity left off."}</p>
        <form onSubmit={submitAuth} className="form-stack">
          {authMode === "register" && <><label>Full name<input required value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="e.g. Sreeja Narsim" autoComplete="name"/></label></>}
          <label>Email address<input required type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="you@college.edu" autoComplete="email"/></label>
          <label>Password<div className="password-field"><input required minLength="8" type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({...form,password:e.target.value})} placeholder="At least 8 characters" autoComplete={authMode === "login" ? "current-password" : "new-password"}/><button type="button" onClick={() => setShowPassword(v => !v)}>{showPassword ? "Hide" : "Show"}</button></div></label>
          {authMode === "register" && <>
            <label>Skills you can teach<input value={form.skillsToTeach} onChange={e => setForm({...form,skillsToTeach:e.target.value})} placeholder="Python, Figma, Java"/></label>
            <label>Skills you want to learn<input value={form.skillsToLearn} onChange={e => setForm({...form,skillsToLearn:e.target.value})} placeholder="React, SQL, Machine Learning"/></label>
            <label className="checkline"><input type="checkbox" required/> <span>I agree to use SkillSwap respectfully.</span></label>
            <label>Confirm password<input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Enter password again" autoComplete="new-password"/></label>
          </>}
          {message && <div className="form-message">{message}</div>}
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Please wait…" : authMode === "register" ? "Create my account  →" : "Log in to SkillSwap  →"}</button>
        </form>
        <div className="auth-foot">{authMode === "register" ? "Already part of the community?" : "New to SkillSwap?"} <button onClick={() => { setAuthMode(authMode === "register" ? "login" : "register"); setMessage(""); }}>{authMode === "register" ? "Log in" : "Create an account"}</button></div>
        <small className="demo-note">Demo note: registration uses your Spring Boot API. Login requires the backend endpoint included in the setup guide.</small>
      </section>
    </main>}

    {page === "Dashboard" && <main className="workspace">
      <aside className="sidebar"><div className="side-label">YOUR SPACE</div>{[["Dashboard","▦"],["Discover","⌕"],["Messages","✉"],["Achievements","♜"]].map(([n,ic]) => <button key={n} className={page===n?"side-link chosen":"side-link"} onClick={() => nav(n)}><span>{ic}</span>{n}{n==="Messages" && <i>2</i>}</button>)}<div className="sidebar-bottom"><div className="sidebar-promo"><span>✦</span><b>Keep growing!</b><p>One new skill can open a whole new world.</p><button onClick={() => nav("Discover")}>Find a skill ↗</button></div><button className="side-link" onClick={logout}><span>↪</span>Sign out</button></div></aside>
      <section className="dashboard-main"><div className="dash-top"><div><span className="eyebrow">YOUR LEARNING SPACE</span><h1>Hey, {current?.name?.split(" ")[0] || "Learner"} <span>✦</span></h1><p>Every expert was once a beginner. What will you explore today?</p></div><div className="dash-date">{new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</div></div>
        <div className="welcome-banner"><div><span className="banner-kicker">YOUR JOURNEY, YOUR PACE</span><h2>Curiosity looks good on you.</h2><p>Make a connection today and take one step closer to your next big thing.</p><button className="btn btn-white" onClick={() => nav("Discover")}>Discover people →</button></div><div className="banner-spark">✦</div></div>
        <div className="stats-grid"><div className="stat-card"><span className="stat-symbol violet">⇄</span><small>Skill matches</small><strong>{matches.length}</strong><em>people to explore</em></div><div className="stat-card"><span className="stat-symbol green">✦</span><small>Learning XP</small><strong>{xp}</strong><em>keep the momentum</em></div><div className="stat-card"><span className="stat-symbol orange">♜</span><small>Badges earned</small><strong>{Math.floor(xp/100)}</strong><em>little wins count</em></div><div className="stat-card"><span className="stat-symbol pink">♡</span><small>Skills listed</small><strong>{splitSkills(current?.skillsToTeach).length + splitSkills(current?.skillsToLearn).length}</strong><em>your growth toolkit</em></div></div>
        <div className="content-grid"><section className="panel"><div className="panel-head"><div><h3>People you might click with</h3><p>Start with a shared interest.</p></div><button className="text-button" onClick={() => nav("Discover")}>View all ↗</button></div>{matches.slice(0,3).map(s => <StudentRow key={s.email || s.id} student={s} onChat={() => {setChatPartner(s); nav("Messages");}} onConnect={() => {setXp(n=>n+10);notify("Connection request noted! +10 XP");}} />)}</section><section className="panel progress-panel"><div className="panel-head"><div><h3>Your progress</h3><p>Small steps add up.</p></div><span className="progress-emoji">✧</span></div><div className="level-line"><span>Level {Math.floor(xp/100)+1}</span><b>{xp%100}/100 XP</b></div><div className="progress-track"><div style={{width:`${xp%100}%`}}></div></div><p className="progress-hint">{100-(xp%100)} XP to your next level</p><div className="challenge"><span>⚡</span><div><b>Today's tiny challenge</b><p>Send a message to someone with a skill you admire.</p></div></div><button className="btn btn-primary btn-block" onClick={() => nav("Achievements")}>View achievements →</button></section></div>
      </section>
    </main>}

    {page === "Discover" && <main className="discover-page"><div className="page-intro"><span className="eyebrow">THE SKILL EXCHANGE</span><h1>Find your <span className="gradient-text">learning people.</span></h1><p>Great connections start with a shared curiosity.</p></div><div className="search-row"><div className="search-box"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students or skills…"/></div><select value={filter} onChange={e=>setFilter(e.target.value)}>{skillOptions.map(s=><option key={s}>{s}</option>)}</select></div><div className="people-grid">{matches.map(s=><StudentCard key={s.email || s.id} student={s} onChat={()=>{setChatPartner(s);nav("Messages");}} onConnect={()=>{setXp(n=>n+10);notify("Connection request noted! +10 XP");}} />)}</div>{matches.length===0 && <div className="empty-state">No matches yet. Try another search or skill filter.</div>}</main>}

    {page === "Messages" && <main className="messages-page"><div className="page-intro"><span className="eyebrow">YOUR COMMUNITY</span><h1>Good conversations <span className="gradient-text">start here.</span></h1><p>Say hello, share an idea, and learn from one another.</p></div><div className="chat-layout"><aside className="chat-people"><h3>Connections</h3>{allStudents.map(s=><button key={s.email||s.id} className={(chatPartner.email||chatPartner.name)===(s.email||s.name)?"chat-person selected":"chat-person"} onClick={()=>setChatPartner(s)}><span className="person-avatar">{initials(s.name)}</span><span><b>{s.name}</b><small>{splitSkills(s.skillsToTeach)[0] || "SkillSwap member"}</small></span><i></i></button>)}</aside><section className="chat-window"><div className="chat-header"><span className="person-avatar">{initials(chatPartner.name)}</span><div><b>{chatPartner.name}</b><small>SkillSwap community member</small></div><span className="online-pill">● Ready to connect</span></div><div className="chat-body"><div className="chat-welcome"><span>✦</span><b>Start something great.</b><p>Introduce yourself or ask about {splitSkills(chatPartner.skillsToTeach)[0] || "their skills"}.</p></div>{(chats[chatPartner.email||chatPartner.name]||[]).map((m,i)=><div className="message-row mine" key={i}><div className="message-bubble"><p>{m.text}</p><small>{m.time}</small></div></div>)}</div><form className="chat-compose" onSubmit={sendMessage}><input value={chatText} onChange={e=>setChatText(e.target.value)} placeholder={`Message ${chatPartner.name.split(" ")[0]}…`}/><button className="btn btn-primary" aria-label="Send message">Send ↗</button></form><p className="chat-local-note">Prototype: messages are saved in this browser. Add the backend chat API for cross-device messaging.</p></section></div></main>}

    {page === "Achievements" && <main className="achievements-page"><div className="page-intro"><span className="eyebrow">CELEBRATE YOUR PROGRESS</span><h1>Every little win <span className="gradient-text">counts.</span></h1><p>Keep showing up for your curiosity.</p></div><div className="xp-hero"><div className="xp-medal">♜</div><div><span className="eyebrow">YOUR CURRENT LEVEL</span><h2>Level {Math.floor(xp/100)+1} Explorer</h2><p>{xp} XP collected · {100-(xp%100)} XP until the next level</p><div className="progress-track"><div style={{width:`${xp%100}%`}}></div></div></div></div><div className="badge-grid">{[{icon:"🌱",name:"First Steps",desc:"Join the learning journey",need:0},{icon:"✉",name:"Connector",desc:"Send your first message",need:5},{icon:"⚡",name:"Curious Mind",desc:"Collect 100 XP",need:100},{icon:"♜",name:"Skill Builder",desc:"Collect 250 XP",need:250},{icon:"✦",name:"Knowledge Sharer",desc:"Collect 500 XP",need:500},{icon:"🌟",name:"Community Star",desc:"Collect 1000 XP",need:1000}].map(b=><div key={b.name} className={xp>=b.need?"badge-card unlocked":"badge-card locked"}><span className="badge-art">{b.icon}</span><h3>{b.name}</h3><p>{b.desc}</p><span className="badge-status">{xp>=b.need?"✓ Unlocked":"🔒 Locked"}</span></div>)}</div><button className="btn btn-primary" onClick={()=>{setXp(n=>n+10);notify("+10 XP — keep it up!");}}>Claim daily practice bonus +10 XP</button></main>}

    {page === "How it works" && <main className="how-page"><div className="page-intro"><span className="eyebrow">SIMPLE BY DESIGN</span><h1>Teach a little. <span className="gradient-text">Learn a lot.</span></h1><p>Three steps to turn what you know into something new.</p></div><div className="steps-grid"><div className="step-card"><span>01</span><div className="feature-icon lavender">✎</div><h2>Show what you know</h2><p>Add the skills you can teach and the skills you want to learn to your student profile.</p></div><div className="step-card"><span>02</span><div className="feature-icon mint">⌕</div><h2>Find your match</h2><p>Explore the community, search skills, and connect with students who share your goals.</p></div><div className="step-card"><span>03</span><div className="feature-icon peach">✦</div><h2>Swap and grow</h2><p>Start a conversation, share knowledge, and celebrate every step of your progress.</p></div></div><div className="center-cta"><button className="btn btn-primary btn-lg" onClick={()=>{setPage("Auth");setAuthMode("register");}}>I'm ready to swap ↗</button></div></main>}

    <footer className="footer"><div className="footer-brand"><span className="brand-mark">⇄</span><span>Skill<span>Swap</span></span><p>Share what you know. Discover what you don't.</p></div><div className="footer-links"><button onClick={()=>setPage("Home")}>Home</button><button onClick={()=>setPage("How it works")}>How it works</button><button onClick={()=>setPage("Discover")}>Discover skills</button></div><small>© 2026 SkillSwap · Built for curious minds.</small></footer>
    {toast && <div className="toast"><span>✦</span>{toast}</div>}
  </div>;
}

function StudentRow({student:s,onChat,onConnect}) {
  return <div className="student-row"><span className="person-avatar">{initials(s.name)}</span><div className="student-info"><b>{s.name}</b><small>Can teach: {s.skillsToTeach || "Skills coming soon"}</small><small>Wants to learn: {s.skillsToLearn || "Open to exploring"}</small></div><div className="row-actions"><button className="icon-button" onClick={onChat} title="Message">✉</button><button className="btn btn-light small" onClick={onConnect}>Connect +</button></div></div>;
}
function StudentCard({student:s,onChat,onConnect}) {
  const teach=splitSkills(s.skillsToTeach), learn=splitSkills(s.skillsToLearn);
  return <article className="person-card"><div className="person-card-top"><span className="person-avatar large">{initials(s.name)}</span><span className="match-label">✦ Skill sharer</span></div><h3>{s.name}</h3><p className="person-email">{s.email}</p><div className="skill-label">CAN TEACH</div><div className="skill-tags">{teach.length?teach.map(x=><span key={x}>{x}</span>):<span>Not added yet</span>}</div><div className="skill-label">WANTS TO LEARN</div><div className="skill-tags learn-tags">{learn.length?learn.map(x=><span key={x}>{x}</span>):<span>Open to ideas</span>}</div><div className="person-card-actions"><button className="btn btn-light" onClick={onChat}>✉ Message</button><button className="btn btn-primary" onClick={onConnect}>Connect ↗</button></div></article>;
}
export default App;
