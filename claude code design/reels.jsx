// Reels Luiza na Cozinha — animações verticais 1080x1920
const { Stage, Sprite, useTime, useSprite, Easing, interpolate, animate } = window;

// ─── helpers ───
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

// =============== REEL 01 — O RELÓGIO DAS 18H ===============
function Reel1() {
  return (
    <Stage width={1080} height={1920} duration={8} background="#1E1810" persistKey="reel1">
      <Reel1Inner/>
    </Stage>
  );
}
function Reel1Inner() {
  const t = useTime();
  return (
    <div style={{position:'absolute', inset:0, overflow:'hidden'}}>
      {/* fundo terracota que entra aos 5s */}
      <div style={{
        position:'absolute', inset:0,
        background:'#C8572A',
        clipPath: t < 5 ? 'circle(0% at 50% 50%)' : `circle(${interpolate([5, 6.2],[0, 150], Easing.easeInOutCubic)(t)}% at 50% 50%)`,
        transition:'none',
      }}/>

      {/* Topbar persistente */}
      <Sprite start={0.2} end={8} keepMounted>
        {({localTime, duration}) => {
          const fade = clamp(localTime/0.4, 0, 1);
          return (
            <div style={{
              position:'absolute', top:80, left:60, right:60,
              display:'flex', justifyContent:'space-between',
              fontFamily:'DM Mono', fontSize:18, letterSpacing:'0.25em', textTransform:'uppercase',
              color: t < 5 ? 'rgba(255,253,249,0.5)' : 'rgba(255,253,249,0.85)',
              opacity: fade, zIndex:10,
            }}>
              <span>● LUIZA NA COZINHA</span>
              <span>terça-feira</span>
            </div>
          );
        }}
      </Sprite>

      {/* Cena 1 (0-2.5s): Relógio editorial 18:47 */}
      <Sprite start={0.3} end={2.6}>
        {({localTime, duration}) => {
          const enter = Easing.easeOutCubic(clamp(localTime/0.7, 0, 1));
          const exit = clamp((localTime - (duration - 0.5))/0.5, 0, 1);
          const op = enter * (1 - exit);
          const ty = (1-enter)*30 + exit*-20;
          return (
            <>
              <div style={{
                position:'absolute', top:380, left:0, right:0,
                textAlign:'center',
                fontFamily:'DM Mono', fontSize:22, letterSpacing:'0.4em', textTransform:'uppercase',
                color:'rgba(232,120,79,0.85)', opacity:op, transform:`translateY(${ty}px)`,
              }}>— são —</div>
              <div style={{
                position:'absolute', top:480, left:0, right:0,
                textAlign:'center',
                fontFamily:'Playfair Display', fontWeight:900, fontSize:380, fontStyle:'italic',
                color:'#E8784F', lineHeight:0.85, letterSpacing:'-0.05em',
                opacity:op, transform:`translateY(${ty}px)`,
              }}>18<span style={{color:'#C49A3C'}}>:</span>47</div>
              <div style={{
                position:'absolute', top:920, left:0, right:0,
                textAlign:'center',
                fontFamily:'Instrument Serif', fontStyle:'italic', fontSize:42,
                color:'rgba(255,253,249,0.7)', opacity:op, transform:`translateY(${ty}px)`,
              }}>de uma terça qualquer.</div>
            </>
          );
        }}
      </Sprite>

      {/* Cena 2 (2.6-5s): pergunta gigante */}
      <Sprite start={2.6} end={5.0}>
        {({localTime, duration}) => {
          const word1 = clamp((localTime-0.0)/0.4, 0, 1);
          const word2 = clamp((localTime-0.5)/0.4, 0, 1);
          const word3 = clamp((localTime-1.0)/0.4, 0, 1);
          const word4 = clamp((localTime-1.5)/0.4, 0, 1);
          const exit = clamp((localTime - 2.0)/0.4, 0, 1);
          const fadeOut = 1-exit;
          const W = (e, txt, color) => (
            <div style={{
              fontFamily:'Playfair Display', fontWeight:700, fontSize:140, lineHeight:0.95,
              letterSpacing:'-0.03em', color, opacity:e*fadeOut,
              transform:`translateY(${(1-e)*40}px)`,
            }}>{txt}</div>
          );
          return (
            <div style={{
              position:'absolute', top:560, left:60, right:60, color:'#FFFDF9',
            }}>
              {W(word1, 'O que', '#FFFDF9')}
              {W(word2, 'você vai', '#FFFDF9')}
              <div style={{ fontStyle:'italic', fontWeight:400, color:'#E8784F', opacity:word3*fadeOut, transform:`translateY(${(1-word3)*40}px)`, fontFamily:'Playfair Display', fontSize:160, lineHeight:0.95 }}>jantar?</div>
              <div style={{
                marginTop:60,
                fontFamily:'Instrument Serif', fontStyle:'italic', fontSize:38,
                color:'rgba(255,253,249,0.6)',
                opacity:word4*fadeOut, transform:`translateY(${(1-word4)*40}px)`,
              }}>(você não sabe. ninguém nunca sabe.)</div>
            </div>
          );
        }}
      </Sprite>

      {/* Cena 3 (5-8s): solução terracota */}
      <Sprite start={5} end={8}>
        {({localTime, duration}) => {
          const e1 = Easing.easeOutBack(clamp((localTime-0.7)/0.5, 0, 1));
          const e2 = Easing.easeOutCubic(clamp((localTime-1.3)/0.5, 0, 1));
          const e3 = Easing.easeOutCubic(clamp((localTime-1.9)/0.5, 0, 1));
          return (
            <div style={{position:'absolute', inset:0}}>
              <div style={{
                position:'absolute', top:520, left:0, right:0, textAlign:'center',
                fontFamily:'DM Mono', fontSize:20, letterSpacing:'0.3em', textTransform:'uppercase',
                color:'#C49A3C', opacity:e1,
                transform:`translateY(${(1-e1)*20}px)`,
              }}>— A SOLUÇÃO —</div>
              <div style={{
                position:'absolute', top:600, left:60, right:60, textAlign:'center',
                fontFamily:'Playfair Display', fontWeight:700, fontSize:200, lineHeight:0.9,
                letterSpacing:'-0.03em', color:'#FFFDF9',
                opacity:e1, transform:`scale(${0.85 + 0.15*e1})`,
              }}>2<span style={{fontStyle:'italic', color:'#C49A3C'}}>′</span></div>
              <div style={{
                position:'absolute', top:880, left:60, right:60, textAlign:'center',
                fontFamily:'Playfair Display', fontStyle:'italic', fontSize:64, lineHeight:1,
                color:'#FFFDF9', opacity:e2, transform:`translateY(${(1-e2)*20}px)`,
              }}>e o cardápio<br/>está pronto.</div>
              <div style={{
                position:'absolute', bottom:280, left:60, right:60, textAlign:'center',
                opacity:e3, transform:`translateY(${(1-e3)*20}px)`,
              }}>
                <div style={{
                  display:'inline-block', background:'#1E1810', color:'#FFFDF9',
                  padding:'24px 48px', borderRadius:999,
                  fontFamily:'DM Sans', fontSize:24, fontWeight:500,
                }}>luizanacozinha.app <span style={{color:'#E8784F'}}>→</span></div>
              </div>
            </div>
          );
        }}
      </Sprite>

      <div className="grain-fx"/>
    </div>
  );
}

// =============== REEL 02 — CONTAGEM REGRESSIVA ===============
function Reel2() {
  return (
    <Stage width={1080} height={1920} duration={6} background="#F7F2EA" persistKey="reel2">
      <Reel2Inner/>
    </Stage>
  );
}
function Reel2Inner() {
  const t = useTime();
  // background flips: 0-0.7 sand, 0.7-1.4 charcoal, etc, alternating
  const bgs = ['#EDE4D3', '#1E1810', '#C8572A', '#5C7A5E', '#1E1810', '#C8572A'];
  const numbers = [
    {n:'5', label:'cliques', color:'#1E1810'},
    {n:'4', label:'dias planejados', color:'#FFFDF9'},
    {n:'3', label:'refeições/dia', color:'#FFFDF9'},
    {n:'2', label:'minutos', color:'#FFFDF9'},
    {n:'1', label:'app só', color:'#C49A3C'},
  ];
  return (
    <div style={{position:'absolute', inset:0, overflow:'hidden'}}>
      {/* Stack of full-bleed bg sections, switched per beat */}
      {numbers.map((item, i) => {
        const start = i * 0.85;
        const end = start + 0.85;
        const visible = t >= start && t < end + 0.1;
        if (!visible) return null;
        return (
          <Sprite key={i} start={start} end={end + 0.1}>
            {({localTime, duration}) => {
              const e = Easing.easeOutBack(clamp(localTime/0.35, 0, 1));
              const exit = clamp((localTime - 0.65)/0.2, 0, 1);
              const op = (1-exit);
              return (
                <div style={{position:'absolute', inset:0, background:bgs[i], opacity:op}}>
                  <div style={{
                    position:'absolute', top:120, left:60, right:60,
                    display:'flex', justifyContent:'space-between',
                    fontFamily:'DM Mono', fontSize:20, letterSpacing:'0.25em', textTransform:'uppercase',
                    color: i === 0 ? '#9B7B5E' : 'rgba(255,253,249,0.6)',
                  }}>
                    <span>LUIZA NA COZINHA</span>
                    <span>0{i+1} / 05</span>
                  </div>
                  <div style={{
                    position:'absolute', top:0, left:0, right:0, bottom:0,
                    display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column',
                  }}>
                    <div style={{
                      fontFamily:'Playfair Display', fontWeight:900, fontStyle:'italic',
                      fontSize:780, lineHeight:0.85, color: item.color,
                      letterSpacing:'-0.06em',
                      transform:`scale(${e}) rotate(${(1-e)*-8}deg)`,
                      opacity: e,
                    }}>{item.n}</div>
                    <div style={{
                      marginTop:0,
                      fontFamily:'Instrument Serif', fontStyle:'italic',
                      fontSize:80, color: item.color,
                      opacity: clamp((localTime-0.3)/0.3, 0, 1),
                      transform:`translateY(${(1-clamp((localTime-0.3)/0.3,0,1))*30}px)`,
                    }}>{item.label}</div>
                  </div>
                </div>
              );
            }}
          </Sprite>
        );
      })}

      {/* Última cena (4.25-6s): payoff */}
      <Sprite start={4.25} end={6}>
        {({localTime, duration}) => {
          const e1 = Easing.easeOutCubic(clamp(localTime/0.5, 0, 1));
          const e2 = Easing.easeOutCubic(clamp((localTime-0.6)/0.5, 0, 1));
          const e3 = Easing.easeOutBack(clamp((localTime-1.1)/0.5, 0, 1));
          return (
            <div style={{position:'absolute', inset:0, background:'#F7F2EA'}}>
              <div style={{
                position:'absolute', top:120, left:60, right:60,
                display:'flex', justifyContent:'space-between',
                fontFamily:'DM Mono', fontSize:20, letterSpacing:'0.25em', textTransform:'uppercase',
                color:'#C8572A', opacity:e1,
              }}>
                <span>● O RESULTADO</span>
                <span>luizanacozinha.app</span>
              </div>
              <div style={{
                position:'absolute', top:600, left:60, right:60,
                fontFamily:'Playfair Display', fontWeight:700, fontSize:140, lineHeight:0.92,
                color:'#1E1810', letterSpacing:'-0.025em',
                opacity:e1, transform:`translateY(${(1-e1)*30}px)`,
              }}>Cardápio<br/>da semana<br/><em style={{color:'#C8572A', fontWeight:400}}>pronto.</em></div>
              <div style={{
                position:'absolute', top:1200, left:60, right:60,
                fontFamily:'Instrument Serif', fontStyle:'italic', fontSize:42,
                color:'rgba(30,24,16,0.65)', lineHeight:1.3,
                opacity:e2, transform:`translateY(${(1-e2)*20}px)`,
              }}>Sem improviso. Sem culpa.<br/>Sem geladeira aberta às 18h.</div>
              <div style={{
                position:'absolute', bottom:280, left:0, right:0, textAlign:'center',
                opacity:e3, transform:`scale(${0.9 + 0.1*e3})`,
              }}>
                <div style={{
                  display:'inline-block', background:'#C8572A', color:'#FFFDF9',
                  padding:'28px 52px', borderRadius:999,
                  fontFamily:'DM Sans', fontSize:28, fontWeight:500,
                }}>Começar grátis →</div>
              </div>
            </div>
          );
        }}
      </Sprite>

      <div className="grain-fx" style={{opacity:0.25}}/>
    </div>
  );
}

// =============== REEL 03 — TICKER DA GELADEIRA ===============
function Reel3() {
  return (
    <Stage width={1080} height={1920} duration={7} background="#1E1810" persistKey="reel3">
      <Reel3Inner/>
    </Stage>
  );
}
function Reel3Inner() {
  const t = useTime();
  const items = [
    'OVO MEXIDO',
    'MIOJO',
    'OVO MEXIDO DE NOVO',
    'IFOOD R$ 67,40',
    'PÃO COM QUEIJO',
    'BISCOITO ÁGUA E SAL',
    'PIZZA CONGELADA',
    'MIOJO COM OVO',
    'IFOOD R$ 71,20',
    'CEREAL COM LEITE',
    'NUGGETS NO AIRFRYER',
    'IFOOD R$ 89,90',
  ];
  return (
    <div style={{position:'absolute', inset:0, overflow:'hidden', background:'#1E1810'}}>
      {/* Topbar */}
      <Sprite start={0} end={7} keepMounted>
        {({localTime}) => {
          const fade = clamp(localTime/0.5, 0, 1);
          return (
            <div style={{
              position:'absolute', top:80, left:60, right:60,
              display:'flex', justifyContent:'space-between',
              fontFamily:'DM Mono', fontSize:20, letterSpacing:'0.25em', textTransform:'uppercase',
              color:'#E8784F', opacity:fade, zIndex:10,
            }}>
              <span>● HISTÓRICO · ÚLTIMOS 30 DIAS</span>
              <span>terça · 18h</span>
            </div>
          );
        }}
      </Sprite>

      {/* Header */}
      <Sprite start={0.3} end={5.5}>
        {({localTime, duration}) => {
          const e = Easing.easeOutCubic(clamp(localTime/0.5, 0, 1));
          const exit = clamp((localTime - (duration-0.5))/0.5, 0, 1);
          return (
            <div style={{
              position:'absolute', top:200, left:60, right:60,
              fontFamily:'Playfair Display', fontWeight:700, fontSize:88, lineHeight:0.95,
              color:'#FFFDF9', letterSpacing:'-0.025em',
              opacity:e*(1-exit),
            }}>O que você<br/><em style={{fontStyle:'italic', fontWeight:400, color:'#E8784F'}}>jantou</em> esse mês:</div>
          );
        }}
      </Sprite>

      {/* Ticker rolling */}
      <Sprite start={0.5} end={5.5}>
        {({localTime, duration}) => {
          const exit = clamp((localTime - (duration-0.4))/0.4, 0, 1);
          // each item takes 0.35s to scroll
          const totalScroll = items.length * 100;
          const offset = interpolate([0, duration-0.4], [0, totalScroll], Easing.linear)(localTime);
          return (
            <div style={{
              position:'absolute', top:520, bottom:280, left:60, right:60,
              overflow:'hidden', opacity:1-exit,
              maskImage:'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
              WebkitMaskImage:'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
            }}>
              <div style={{
                position:'absolute', top:0, left:0, right:0,
                transform:`translateY(${-offset}px)`,
              }}>
                {[...items, ...items].map((it, i) => {
                  const isDelivery = it.startsWith('IFOOD');
                  return (
                    <div key={i} style={{
                      padding:'28px 0',
                      borderBottom:'1px dashed rgba(255,253,249,0.18)',
                      display:'flex', justifyContent:'space-between', alignItems:'baseline',
                    }}>
                      <span style={{
                        fontFamily:'DM Mono', fontSize:32, letterSpacing:'0.05em',
                        color: isDelivery ? '#E8784F' : '#FFFDF9',
                      }}>{String(i+1).padStart(2,'0')} · {it}</span>
                      <span style={{
                        fontFamily:'Instrument Serif', fontStyle:'italic', fontSize:32,
                        color:'rgba(255,253,249,0.4)',
                      }}>{isDelivery ? '→ R$' : '✗'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }}
      </Sprite>

      {/* Brake / payoff (5.5-7s): "chega." */}
      <Sprite start={5.5} end={7}>
        {({localTime, duration}) => {
          const e = Easing.easeOutBack(clamp(localTime/0.5, 0, 1));
          const e2 = Easing.easeOutCubic(clamp((localTime-0.7)/0.5, 0, 1));
          return (
            <div style={{position:'absolute', inset:0, background:'#C8572A'}}>
              <div style={{
                position:'absolute', top:0, left:0, right:0, bottom:0,
                display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column',
              }}>
                <div style={{
                  fontFamily:'Playfair Display', fontStyle:'italic', fontWeight:700,
                  fontSize:380, color:'#FFFDF9', lineHeight:0.85, letterSpacing:'-0.04em',
                  transform:`scale(${e}) rotate(${(1-e)*-5}deg)`,
                  opacity:e,
                }}>chega.</div>
                <div style={{
                  marginTop:60,
                  fontFamily:'Instrument Serif', fontStyle:'italic', fontSize:48,
                  color:'rgba(255,253,249,0.85)', textAlign:'center', maxWidth:800, lineHeight:1.3,
                  opacity:e2, transform:`translateY(${(1-e2)*20}px)`,
                }}>cardápio da semana em<br/><strong style={{color:'#C49A3C', fontWeight:700}}>2 minutos.</strong></div>
                <div style={{
                  marginTop:80,
                  display:'inline-block', background:'#1E1810', color:'#FFFDF9',
                  padding:'24px 44px', borderRadius:999,
                  fontFamily:'DM Sans', fontSize:24, fontWeight:500,
                  opacity:e2, transform:`translateY(${(1-e2)*20}px)`,
                }}>luizanacozinha.app →</div>
              </div>
            </div>
          );
        }}
      </Sprite>

      <div className="grain-fx"/>
    </div>
  );
}

// =============== REEL 04 — ANTES × DEPOIS (SPLIT) ===============
function Reel4() {
  return (
    <Stage width={1080} height={1920} duration={7} background="#000" persistKey="reel4">
      <Reel4Inner/>
    </Stage>
  );
}
function Reel4Inner() {
  const t = useTime();

  // 0-1.0: hook full screen
  // 1.0-2.5: split appears, left side fills with chaos
  // 2.5-4.5: right side fills with calm
  // 4.5-7: merge to terracota CTA

  const splitProgress = clamp((t - 0.8) / 0.6, 0, 1); // 0..1 split opens
  const leftItems = ['20 min na geladeira', '3 abas de receita', 'iFood pela 4ª vez', 'culpa silenciosa', 'ovo mexido. de novo.'];
  const rightItems = ['cardápio em 2 min', 'lista pronta', 'geladeira sabe', 'culpa zero', 'jantar sem stress'];

  const leftItemFade = (idx) => clamp((t - (1.4 + idx * 0.18)) / 0.3, 0, 1);
  const rightItemFade = (idx) => clamp((t - (3.0 + idx * 0.18)) / 0.3, 0, 1);

  const ctaProg = clamp((t - 5.0) / 0.7, 0, 1);
  const ctaProgEased = Easing.easeInOutCubic(ctaProg);

  return (
    <div style={{position:'absolute', inset:0, overflow:'hidden'}}>
      {/* Background charcoal base */}
      <div style={{position:'absolute', inset:0, background:'#1E1810'}}/>

      {/* HOOK 0-1s */}
      <Sprite start={0} end={1.1}>
        {({localTime, duration}) => {
          const e = Easing.easeOutCubic(clamp(localTime/0.4, 0, 1));
          const exit = clamp((localTime-0.7)/0.4, 0, 1);
          return (
            <div style={{
              position:'absolute', inset:0,
              display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column',
              opacity: e * (1-exit),
            }}>
              <div style={{
                fontFamily:'DM Mono', fontSize:22, letterSpacing:'0.3em', textTransform:'uppercase',
                color:'#E8784F', marginBottom:30,
              }}>★ MESMA TERÇA-FEIRA ★</div>
              <div style={{
                fontFamily:'Playfair Display', fontWeight:700, fontStyle:'italic', fontSize:200, lineHeight:0.92,
                color:'#FFFDF9', textAlign:'center', letterSpacing:'-0.03em',
              }}>duas vidas.</div>
            </div>
          );
        }}
      </Sprite>

      {/* SPLIT — opens after hook. Two halves stacked vertically (works for 9:16 better) */}
      {t > 0.8 && t < 5.2 && (
        <>
          {/* TOP HALF — ANTES (charcoal) */}
          <div style={{
            position:'absolute', top:0, left:0, right:0,
            height: `${50 * splitProgress}%`,
            background:'#1E1810', overflow:'hidden',
            borderBottom: splitProgress > 0.95 ? '2px solid #C8572A' : 'none',
          }}>
            <div style={{
              position:'absolute', top:80, left:60, right:60,
              fontFamily:'DM Mono', fontSize:18, letterSpacing:'0.3em', textTransform:'uppercase',
              color:'#E8784F', opacity: splitProgress > 0.7 ? (splitProgress-0.7)/0.3 : 0,
            }}>— ANTES</div>
            <div style={{
              position:'absolute', top:140, left:60, right:60,
              fontFamily:'Playfair Display', fontWeight:700, fontSize:96, lineHeight:0.92, color:'#FFFDF9',
              letterSpacing:'-0.025em',
              opacity: splitProgress > 0.85 ? 1 : 0,
              transform: `translateY(${splitProgress > 0.85 ? 0 : 20}px)`,
              transition:'none',
            }}>O <em style={{fontStyle:'italic', color:'#E8784F', fontWeight:400}}>caos.</em></div>
            <div style={{
              position:'absolute', top:340, left:60, right:60,
            }}>
              {leftItems.map((it, i) => {
                const f = leftItemFade(i);
                return (
                  <div key={i} style={{
                    padding:'14px 0',
                    fontFamily:'Instrument Serif', fontStyle:'italic', fontSize:38,
                    color:'rgba(255,253,249,0.8)',
                    opacity:f, transform:`translateX(${(1-f)*-30}px)`,
                    borderBottom:'1px dashed rgba(255,253,249,0.15)',
                  }}>— {it}</div>
                );
              })}
            </div>
          </div>

          {/* BOTTOM HALF — DEPOIS (creme) — slides in from below */}
          <div style={{
            position:'absolute', bottom:0, left:0, right:0,
            height: `${50 * splitProgress}%`,
            background:'#F7F2EA', overflow:'hidden',
          }}>
            <div style={{
              position:'absolute', top:80, left:60, right:60,
              fontFamily:'DM Mono', fontSize:18, letterSpacing:'0.3em', textTransform:'uppercase',
              color:'#C8572A', opacity: splitProgress > 0.7 ? (splitProgress-0.7)/0.3 : 0,
            }}>DEPOIS —</div>
            <div style={{
              position:'absolute', top:140, left:60, right:60,
              fontFamily:'Playfair Display', fontWeight:700, fontSize:96, lineHeight:0.92, color:'#1E1810',
              letterSpacing:'-0.025em',
              opacity: splitProgress > 0.85 ? 1 : 0,
            }}>A <em style={{fontStyle:'italic', color:'#C8572A', fontWeight:400}}>paz.</em></div>
            <div style={{
              position:'absolute', top:340, left:60, right:60,
            }}>
              {rightItems.map((it, i) => {
                const f = rightItemFade(i);
                return (
                  <div key={i} style={{
                    padding:'14px 0',
                    fontFamily:'Instrument Serif', fontStyle:'italic', fontSize:38,
                    color:'#3D2B1F',
                    opacity:f, transform:`translateX(${(1-f)*30}px)`,
                    borderBottom:'1px dashed rgba(30,24,16,0.18)',
                    display:'flex', gap:14, alignItems:'baseline',
                  }}>
                    <span style={{color:'#5C7A5E', fontStyle:'normal', fontFamily:'DM Sans', fontWeight:700}}>✓</span>
                    {it}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* CTA 5.0-7s — terracota wipe over everything */}
      {ctaProg > 0 && (
        <div style={{
          position:'absolute', inset:0, background:'#C8572A',
          clipPath: `circle(${ctaProgEased * 150}% at 50% 50%)`,
          color:'#FFFDF9',
        }}>
          <Sprite start={5.4} end={7}>
            {({localTime, duration}) => {
              const e = Easing.easeOutCubic(clamp(localTime/0.5, 0, 1));
              const e2 = Easing.easeOutCubic(clamp((localTime-0.5)/0.5, 0, 1));
              const e3 = Easing.easeOutBack(clamp((localTime-1.0)/0.5, 0, 1));
              return (
                <div style={{
                  position:'absolute', inset:0,
                  display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column',
                  padding:'0 60px',
                }}>
                  <div style={{
                    fontFamily:'DM Mono', fontSize:22, letterSpacing:'0.3em', textTransform:'uppercase',
                    color:'#C49A3C', marginBottom:30, opacity:e,
                  }}>★ ESCOLHA UMA</div>
                  <div style={{
                    fontFamily:'Playfair Display', fontWeight:700, fontSize:160, lineHeight:0.9,
                    color:'#FFFDF9', textAlign:'center', letterSpacing:'-0.03em',
                    opacity:e, transform:`translateY(${(1-e)*30}px)`,
                  }}>duas vidas.<br/><em style={{fontStyle:'italic', fontWeight:400, color:'#C49A3C'}}>uma decisão.</em></div>
                  <div style={{
                    marginTop:60,
                    fontFamily:'Instrument Serif', fontStyle:'italic', fontSize:40,
                    color:'rgba(255,253,249,0.85)', textAlign:'center', maxWidth:800,
                    opacity:e2, transform:`translateY(${(1-e2)*20}px)`,
                  }}>2 minutos por semana.<br/>O resto do tempo é seu.</div>
                  <div style={{
                    marginTop:80,
                    opacity:e3, transform:`scale(${0.85 + 0.15*e3})`,
                  }}>
                    <div style={{
                      display:'inline-block', background:'#1E1810', color:'#FFFDF9',
                      padding:'26px 48px', borderRadius:999,
                      fontFamily:'DM Sans', fontSize:26, fontWeight:500,
                    }}>luizanacozinha.app <span style={{color:'#E8784F'}}>→</span></div>
                  </div>
                </div>
              );
            }}
          </Sprite>
        </div>
      )}

      <div className="grain-fx"/>
    </div>
  );
}

// Mount each into its own root
ReactDOM.createRoot(document.getElementById('reel-1')).render(<Reel1/>);
ReactDOM.createRoot(document.getElementById('reel-2')).render(<Reel2/>);
ReactDOM.createRoot(document.getElementById('reel-3')).render(<Reel3/>);
ReactDOM.createRoot(document.getElementById('reel-4')).render(<Reel4/>);
