const { useState } = React;

// =================== POST 01 — HERO TIPOGRÁFICO TERRACOTA ===================
function Post01() {
  return (
    <div className="post p01 grain">
      <div className="topbar">
        <span><span className="dot"></span>LUIZA NA COZINHA · ED. 47</span>
        <span className="ed">PILAR A · MAIO 2026</span>
      </div>
      <div className="massive">
        Geladeira<br/>cheia.<br/>
        <em>cabeça vazia.</em>
      </div>
      <div className="stamp">EDITORIAL — Nº 47</div>
      <div className="footer">
        <div className="lede">Toda noite, às 18h47, a mesma cena se repete em milhões de cozinhas brasileiras.</div>
        <div className="badge">luizanacozinha.app</div>
      </div>
    </div>
  );
}

// =================== POST 02 — HERO MINIMAL CRÈME ===================
function Post02() {
  return (
    <div className="post p02 grain-light">
      <div className="topbar">
        <span>LUIZA NA COZINHA</span>
        <span>Nº 048 — TERÇA</span>
      </div>
      <div className="number">2′</div>
      <div className="number-sub">tempo médio</div>
      <div className="annotation">tempo que leva pra fazer um cardápio inteiro da semana, de verdade</div>
      <div className="body">
        <h2>Dois minutos.<br/>Sete dias.<br/><em>Cabeça em paz.</em></h2>
        <p>O cardápio da sua semana — café, almoço, jantar e lanches — pronto antes do café esfriar. Sem planilha, sem stress, sem aquela aba do Pinterest aberta há três meses.</p>
      </div>
      <div className="underline"></div>
      <div className="footer">
        <span>luizanacozinha.app</span>
        <span>Salva esse post →</span>
      </div>
    </div>
  );
}

// =================== POST 03 — QUOTE CHARCOAL ===================
function Post03() {
  return (
    <div className="post p03 grain">
      <div className="vignette"></div>
      <div className="topbar">
        <span>★ DEPOIMENTO REAL</span>
        <span>USUÁRIA · 3 SEMANAS</span>
      </div>
      <div className="quote-mark">"</div>
      <div className="ticks">
        <div className="tick" style={{top: '15%'}}></div>
        <div className="tick" style={{top: '40%'}}></div>
        <div className="tick" style={{top: '65%'}}></div>
        <div className="tick" style={{top: '85%'}}></div>
      </div>
      <div className="headline">
        <strong>Eu não sabia</strong><br/>
        que o problema<br/>
        nunca foi <em>cozinhar.</em>
      </div>
      <div className="attr">CAMILA, 34 — SÃO PAULO</div>
      <div className="footer">
        <span>luizanacozinha.app</span>
        <span>+2.300 famílias</span>
      </div>
    </div>
  );
}

// =================== CARROSSEL — 7 SLIDES ===================
const carouselScenes = [
  { num: '01', time: '18h07', title: 'Você abre a geladeira', em: 'pela quinta vez.', sub: 'esperando que algo apareça.', desc: 'Não aparece. Você sabe. Mas continua abrindo. É uma forma moderna de oração.' },
  { num: '02', time: '18h23', title: 'Pesquisa "jantar', em: 'fácil rápido"', sub: 'a quinta-feira inteira.', desc: 'Aparecem 47 receitas. Todas pedem ingredientes que você não tem. Frescor é privilégio de domingo.' },
  { num: '03', time: '18h45', title: 'Considera, brevemente,', em: 'comer biscoito.', sub: 'janta dignidade.', desc: 'É 18h45 de uma terça. Adultos não jantam biscoito. Adultos planejam. Você pega o celular.' },
  { num: '04', time: '19h02', title: 'Abre o iFood,', em: 'fecha o iFood.', sub: 'abre de novo. R$67.', desc: 'Frete R$12,90. Taxa de serviço R$3,80. Você fecha. Vai ter que cozinhar. Volta pra geladeira.' },
  { num: '05', time: '19h18', title: 'Faz ovo mexido', em: 'pela terceira vez', sub: 'na semana.', desc: 'É bom. É proteína. É barato. Mas a chef Luiza está chorando em algum lugar e você sabe disso.' },
];

function CarouselCover() {
  return (
    <div className="post car-cover grain">
      <div className="topbar">
        <span>LUIZA NA COZINHA · CARROSSEL</span>
        <span className="pill">PILAR B · ARRASTA →</span>
      </div>
      <div className="number-bg">5</div>
      <div className="kicker">UMA SÉRIE EM 5 ATOS</div>
      <div className="title">Os 5 estágios<br/>de quem <em>não sabe</em><br/>o que jantar.</div>
      <div className="lede">Um teatro doméstico em cinco atos, encenado todas as terças entre 18h e 19h30, em milhões de cozinhas pelo Brasil.</div>
      <div className="swipe">
        <div className="arrow">→</div>
        <div className="label">Arrasta</div>
      </div>
      <div className="footer">
        <span>luizanacozinha.app</span>
        <span>01 / 07</span>
      </div>
    </div>
  );
}

function CarouselScene({ idx }) {
  const s = carouselScenes[idx];
  const slideNum = idx + 2;
  return (
    <div className="post car-scene grain">
      <div className="topbar">
        <span className="label">ATO {s.num} / 05 — {s.time}</span>
        <span className="time">{s.time}</span>
      </div>
      <div className="stage-num">{s.num}</div>
      <div className="badge">
        ATO
        <div className="big">{s.num}</div>
        / 05
      </div>
      <div className="body">
        <h2>{s.title} <em>{s.em}</em></h2>
        <div className="sub">— {s.sub}</div>
        <div className="desc">{s.desc}</div>
      </div>
      <div className="footer">
        <div className="progress">
          {[0,1,2,3,4,5,6].map(i => (
            <div key={i} className={`seg ${i < slideNum ? 'done' : ''}`}></div>
          ))}
        </div>
        <div className="footer-row">
          <span>luizanacozinha.app</span>
          <span>0{slideNum} / 07 →</span>
        </div>
      </div>
    </div>
  );
}

function CarouselCTA() {
  return (
    <div className="post car-cta grain">
      <div className="sun"></div>
      <div className="topbar">
        <span>★ A SAÍDA</span>
        <span>07 / 07</span>
      </div>
      <div className="star">✦</div>
      <div className="body">
        <div className="kicker">A SOLUÇÃO</div>
        <h2>Cardápio da semana<br/>em <em>2 minutos.</em></h2>
        <p>Sete dias planejados. Lista de compras pronta. Receitas detalhadas com dicas da Chef Luiza. Sem improviso. Sem culpa. Sem geladeira aberta às 18h.</p>
      </div>
      <div className="button-bar">
        <div className="btn-main">Começar grátis <span>· luizanacozinha.app</span></div>
        <div className="btn-arrow">→</div>
      </div>
      <div className="footer">
        <span>★ Link na bio</span>
        <span>07 / 07</span>
      </div>
    </div>
  );
}

// =================== ENQUETE ===================
function Enquete() {
  return (
    <div className="post pol grain-light">
      <div className="topbar">
        <span>★ ENQUETE — RESPONDA NOS COMENTÁRIOS</span>
        <span>PILAR D · COMUNIDADE</span>
      </div>
      <div className="kicker">QUINTA-FEIRA, 18H</div>
      <h2>Qual é o seu<br/>maior pesadelo<br/><em>às 18h?</em></h2>
      <div className="annot">a maioria escolhe essa</div>
      <div className="options">
        <div className="opt hot">
          <div>
            <div className="num">A</div>
            <div className="text">Geladeira vazia.</div>
          </div>
          <div className="badge">⚡ Top resposta</div>
        </div>
        <div className="opt">
          <div>
            <div className="num">B</div>
            <div className="text">Não sei o que fazer.</div>
          </div>
        </div>
        <div className="opt">
          <div>
            <div className="num">C</div>
            <div className="text">Sem tempo pra cozinhar.</div>
          </div>
        </div>
        <div className="opt">
          <div>
            <div className="num">D</div>
            <div className="text">Faço sempre a mesma coisa.</div>
          </div>
        </div>
      </div>
      <div className="footer">
        <span>Comenta aí 👇</span>
        <span>luizanacozinha.app</span>
      </div>
    </div>
  );
}

// =================== DEPOIMENTO ===================
function Depoimento() {
  return (
    <div className="post test grain">
      <div className="topbar">
        <span>★ DEPOIMENTO</span>
        <span>USUÁRIA Nº 1.247</span>
      </div>
      <div className="quote-mk">"</div>
      <div className="quote">Antes do app, eu chorei numa <span className="accent">terça</span> porque não sabia o que fazer com meio quilo de frango. Hoje eu sei.</div>
      <div className="stamp">Verificado · 28 dias de uso</div>
      <div className="attr">
        <div className="avatar">B</div>
        <div className="attr-text">
          <div className="name">Bianca Mendes</div>
          <div className="role">USUÁRIA · BELO HORIZONTE</div>
        </div>
      </div>
      <div className="footer">
        <span>luizanacozinha.app</span>
        <span>+2.300 histórias →</span>
      </div>
    </div>
  );
}

// =================== ANTES × DEPOIS ===================
function AntesDepois() {
  return (
    <div className="post ba grain">
      <div className="side left">
        <div className="label">ANTES</div>
        <h2>Toda <em>terça,</em><br/>o mesmo<br/>caos.</h2>
        <ul>
          <li>20 min olhando a geladeira</li>
          <li>3 abas de receitas abertas</li>
          <li>Lista de compras na cabeça</li>
          <li>iFood pela 4ª vez na semana</li>
          <li>Culpa silenciosa</li>
        </ul>
        <div className="footer-l">luizanacozinha.app</div>
      </div>
      <div className="arrow">→</div>
      <div className="side right">
        <div className="label">DEPOIS</div>
        <h2>Mesma <em>terça.</em><br/>Outra<br/>vida.</h2>
        <ul>
          <li>Cardápio pronto domingo</li>
          <li>Lista de compras automática</li>
          <li>Geladeira sabe o que tem</li>
          <li>iFood virou exceção</li>
          <li>Culpa zero</li>
        </ul>
        <div className="footer-r">★ Link na bio</div>
      </div>
    </div>
  );
}

// =================== BIG NUMBER ===================
function BigNumber() {
  return (
    <div className="post stat grain-light">
      <div className="topbar">
        <span><span className="live">AO VIVO</span> DADOS DA COMUNIDADE</span>
        <span>MAIO · 2026</span>
      </div>
      <div className="label">— DESPERDÍCIO MÉDIO</div>
      <div className="number">R$<span className="small">387</span><span className="pct">/mês</span></div>
      <div className="annot">isso dá 4.644 reais por ano. ai.</div>
      <div className="caption">é o que cada família gasta em <em>delivery</em> por não saber o que jantar.</div>
      <div className="source">Pesquisa interna · 2.300 famílias usuárias</div>
      <div className="footer">
        <span>luizanacozinha.app</span>
        <span>★ Salva esse post</span>
      </div>
    </div>
  );
}

// =================== TICKET / RECIBO ===================
function Ticket() {
  return (
    <div className="post ticket">
      <div className="paper">
        <div className="head">
          <div className="brand">Luiza na Cozinha</div>
          <div className="sub">★ RECIBO Nº 047 · TERÇA, 5 MAI ★</div>
        </div>
        <div className="meta">
          <span>USUÁRIA · CAMILA</span>
          <span>SEMANA 18</span>
        </div>
        <div className="title">O que <em>cabe</em><br/>em 2 minutos.</div>
        <div className="items">
          <div className="item"><span className="name">Cardápio · 7 dias</span><span className="dots"></span><span className="val">incluso</span></div>
          <div className="item"><span className="name">Lista de compras</span><span className="dots"></span><span className="val">automática</span></div>
          <div className="item"><span className="name">21 receitas detalhadas</span><span className="dots"></span><span className="val">incluso</span></div>
          <div className="item"><span className="name">Substituições da chef</span><span className="dots"></span><span className="val">incluso</span></div>
          <div className="item"><span className="name">Análise de macros</span><span className="dots"></span><span className="val">novo ✦</span></div>
          <div className="item"><span className="name">Decisão sobre o jantar</span><span className="dots"></span><span className="val">— R$ 0,00</span></div>
          <div className="item"><span className="name">Culpa do delivery</span><span className="dots"></span><span className="val">— R$ 0,00</span></div>
        </div>
        <div className="total">
          <span className="lbl">Total da paz mental</span>
          <span className="val">grátis</span>
        </div>
        <div className="barcode">
          {Array.from({length: 40}).map((_, i) => (
            <span key={i} style={{height: '40px', width: (i % 3 === 0 ? '4px' : i % 2 === 0 ? '2px' : '1px')}}></span>
          ))}
        </div>
        <div className="footer-tk">★ luizanacozinha.app · obrigada pela visita ★</div>
        <div className="stamp">PAGO ✓</div>
      </div>
    </div>
  );
}

// =================== STORY VERTICAL ===================
function Story() {
  return (
    <div className="post post-story story grain">
      <div className="indicators">
        <span></span><span></span><span></span><span></span>
      </div>
      <div className="top">
        <span><span className="live"></span>luizanacozinha</span>
        <span>agora</span>
      </div>
      <div className="clock">18:47</div>
      <div className="clock-sub">— terça-feira —</div>
      <h2>Você não<br/>sabe o que<br/><em>jantar.</em></h2>
      <p>Calma. Existe um botão pra isso agora. Dois minutos e você descobre o que fazer com o que tem na geladeira — sem improviso, sem culpa, sem ovo mexido pela quarta vez.</p>
      <div className="swipe-up">
        <div className="arrow">↑</div>
        <div className="lbl">Arrasta pra cima</div>
      </div>
      <div className="bottom">
        <span>luizanacozinha.app</span>
        <span>link no perfil</span>
      </div>
    </div>
  );
}

// =================== MAGAZINE COVER ===================
function MagCover() {
  return (
    <div className="post post-vert mag grain-light">
      <div className="nameplate">
        <div className="title">Luiza<span style={{color: '#C8572A'}}>·</span></div>
        <div className="meta">EDIÇÃO 47 · MAIO 2026<br/>luizanacozinha.app</div>
      </div>
      <div className="issue">VOL. 047 · ESPECIAL TERÇA-FEIRA</div>
      <div className="feature">A morte<br/>do <em>jantar</em><br/>improvisado.</div>
      <div className="stamp-mag">
        <span style={{fontSize: '10px', letterSpacing: '0.2em'}}>NOVO</span>
        <span className="big">2′</span>
        <span style={{fontSize: '12px', fontStyle: 'italic'}}>cardápio</span>
      </div>
      <div className="deck">Como milhares de famílias brasileiras estão recuperando duas horas por semana — sem cortar carboidrato, sem virar chef, sem comprar mais um curso de meal prep. <em>Por dentro do app.</em></div>
      <div className="toc">
        <h4>NESTA EDIÇÃO</h4>
        <div className="toc-row"><span>Os 5 estágios da geladeira aberta</span><span className="pg">p. 02</span></div>
        <div className="toc-row"><span><em>Eu não sabia que o problema nunca foi cozinhar</em></span><span className="pg">p. 14</span></div>
        <div className="toc-row"><span>R$387 por mês: a matemática do delivery</span><span className="pg">p. 22</span></div>
        <div className="toc-row"><span>Antes × Depois — uma terça qualquer</span><span className="pg">p. 30</span></div>
      </div>
      <div className="footer">
        <span>★ Salva</span>
        <span>luizanacozinha.app</span>
        <span>R$ 0,00</span>
      </div>
    </div>
  );
}

// =================== CANVAS ===================
const { DCSection, DCArtboard, DesignCanvas } = window;

function App() {
  return (
    <DesignCanvas
      title="Luiza na Cozinha — Proposta Editorial"
      subtitle="Sistema visual completo · 12 posts · alto impacto, identidade premium"
    >
      <DCSection id="hero" title="01 · Heróis Editoriais" subtitle="Posts estáticos de impacto — Pilares A e C">
        <DCArtboard id="p01" label="Hero Terracota — Tipografia Brutal" width={1080} height={1080}>
          <Post01/>
        </DCArtboard>
        <DCArtboard id="p02" label="Hero Crème — Editorial Minimal" width={1080} height={1080}>
          <Post02/>
        </DCArtboard>
        <DCArtboard id="p03" label="Hero Charcoal — Cinematográfico" width={1080} height={1080}>
          <Post03/>
        </DCArtboard>
      </DCSection>

      <DCSection id="carousel" title="02 · Carrossel “Os 5 Atos”" subtitle="7 slides · narrativa em ato teatral · Pilar B">
        <DCArtboard id="c0" label="Slide 1 — Capa" width={1080} height={1080}>
          <CarouselCover/>
        </DCArtboard>
        <DCArtboard id="c1" label="Slide 2 — Ato 01" width={1080} height={1080}>
          <CarouselScene idx={0}/>
        </DCArtboard>
        <DCArtboard id="c2" label="Slide 3 — Ato 02" width={1080} height={1080}>
          <CarouselScene idx={1}/>
        </DCArtboard>
        <DCArtboard id="c3" label="Slide 4 — Ato 03" width={1080} height={1080}>
          <CarouselScene idx={2}/>
        </DCArtboard>
        <DCArtboard id="c4" label="Slide 5 — Ato 04" width={1080} height={1080}>
          <CarouselScene idx={3}/>
        </DCArtboard>
        <DCArtboard id="c5" label="Slide 6 — Ato 05" width={1080} height={1080}>
          <CarouselScene idx={4}/>
        </DCArtboard>
        <DCArtboard id="c6" label="Slide 7 — CTA Solução" width={1080} height={1080}>
          <CarouselCTA/>
        </DCArtboard>
      </DCSection>

      <DCSection id="comunidade" title="03 · Comunidade & Social Proof" subtitle="Pilares C e D — engajamento e confiança">
        <DCArtboard id="enq" label="Enquete — Quinta 18h" width={1080} height={1080}>
          <Enquete/>
        </DCArtboard>
        <DCArtboard id="dep" label="Depoimento Editorial" width={1080} height={1080}>
          <Depoimento/>
        </DCArtboard>
        <DCArtboard id="ba" label="Antes × Depois" width={1080} height={1080}>
          <AntesDepois/>
        </DCArtboard>
        <DCArtboard id="stat" label="Big Number — R$387/mês" width={1080} height={1080}>
          <BigNumber/>
        </DCArtboard>
      </DCSection>

      <DCSection id="formatos" title="04 · Formatos Especiais" subtitle="Novos territórios visuais para a marca">
        <DCArtboard id="tkt" label="Recibo — Conceito" width={1080} height={1080}>
          <Ticket/>
        </DCArtboard>
        <DCArtboard id="story" label="Story Vertical" width={1080} height={1920}>
          <Story/>
        </DCArtboard>
        <DCArtboard id="mag" label="Capa de Revista — Vertical" width={1080} height={1350}>
          <MagCover/>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
