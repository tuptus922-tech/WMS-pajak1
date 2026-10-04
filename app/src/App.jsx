import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

import { store, useGame } from './game/store'
import { sfx } from './game/sfx'
import {
  xpNeed, capacity, usedSpace, freeSpace, unitPrice, sellPrice, deliveryMinutes, weatherOf,
  planTrip, autoPickVehicles, dispatch, dismissOrder, acceptContract,
  acceptReturn, acceptAllReturns, startRepair, scrapItem, buyItem, sellItem,
  eventChoices, chooseEvent, closeEvent, repairSlots,
} from './game/engine'
import { orderView, dispatchVehicles } from './game/view'
import { fmtMoney, fmtHour, fmtDur, dayOf, isNight } from './game/format'
import { ITEMS, ITEM_BY_ID } from './game/data/items'
import { LOCATIONS, CLIENTS } from './game/data/world'
import { VEHICLES } from './game/data/vehicles'
import { BUILDINGS, STAFF, rankName } from './game/data/base'
import { EVENT_BY_ID } from './game/data/events'

import Header from './assets/components/Header/Header'
import Hud from './assets/components/Hud/Hud'
import BottomNav from './assets/components/BottomNav/BottomNav'
import Toast from './assets/components/Toast/Toast'
import DispatchModal from './assets/components/DispatchModal/DispatchModal'
import BuyModal from './assets/components/BuyModal/BuyModal'
import EventModal from './assets/components/EventModal/EventModal'
import Overlay from './assets/components/Overlay/Overlay'
import SidePanel from './assets/components/SidePanel/SidePanel'

import PulpitPage from './assets/pages/PulpitPage/PulpitPage'
import ZleceniaPage from './assets/pages/ZleceniaPage/ZleceniaPage'
import MagazynPage from './assets/pages/MagazynPage/MagazynPage'
import TerenPage from './assets/pages/TerenPage/TerenPage'
import UsterkiPage from './assets/pages/UsterkiPage/UsterkiPage'
import BazaPage from './assets/pages/BazaPage/BazaPage'

const WIDE = '(min-width: 1000px)'

// Co odblokowuje dany poziom — lista na planszy awansu.
function unlocksAt(level) {
  const rows = []
  for (const l of LOCATIONS) if (l.lvl === level) rows.push({ icon: l.icon, name: l.name, kind: 'nowe miejsce' })
  for (const c of CLIENTS) if (c.lvl === level && !rows.some((r) => r.name === c.name)) rows.push({ icon: c.icon, name: c.name, kind: 'nowy klient' })
  for (const v of VEHICLES) if (v.lvl === level) rows.push({ icon: v.icon, name: v.name, kind: 'pojazd' })
  for (const b of BUILDINGS) if (b.lvl === level && !b.start) rows.push({ icon: b.icon, name: b.name, kind: 'budynek' })
  for (const st of STAFF) if (st.lvl === level) rows.push({ icon: st.icon, name: st.name, kind: 'kadra' })
  for (const it of ITEMS) if (it.lvl === level) rows.push({ icon: it.icon, name: it.name, kind: 'towar' })
  return rows
}

export default function App() {
  const s = useGame()

  const [tab, setTab] = useState('pulpit')
  const [bazaSection, setBazaSection] = useState('flota')
  const [toast, setToast] = useState('')
  const [pops, setPops] = useState([])
  const [overlays, setOverlays] = useState([])
  const [muted, setMuted] = useState(sfx.muted)
  const [wide, setWide] = useState(() => window.matchMedia(WIDE).matches)

  // okno wysyłki
  const [dispatchId, setDispatchId] = useState(null)
  const [dispatchSel, setDispatchSel] = useState([])
  // okno zakupu
  const [buyId, setBuyId] = useState(null)
  const [buyQty, setBuyQty] = useState(1)

  const toastTimer = useRef(null)
  const popId = useRef(0)

  const showToast = useCallback((text) => {
    setToast(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2800)
  }, [])

  const act = useCallback((fn, ...args) => {
    const res = store.act(fn, ...args)
    if (res.msg) showToast(res.msg)
    if (!res.ok) sfx.play('error')
    return res
  }, [showToast])

  // Powiadomienia z silnika: monety, awanse, odznaki, raporty.
  useEffect(() => store.onFx((item) => {
    if (item.type === 'toast') showToast(item.text)
    else if (item.type === 'sound') sfx.play(item.name)
    else if (item.type === 'coin') {
      const id = ++popId.current
      setPops((list) => [...list.slice(-3), { id, amount: item.amount }])
      setTimeout(() => setPops((list) => list.filter((p) => p.id !== id)), 1300)
      sfx.play('coin')
      showToast(item.text)
    } else if (item.type === 'goal') {
      sfx.play('goal')
      showToast(`🎯 Zadanie wykonane: ${item.title} (+${fmtMoney(item.cash)})`)
    } else if (item.type === 'ach') {
      sfx.play('goal')
      showToast(`${item.icon} Odznaka: ${item.name} (+${fmtMoney(item.cash)})`)
    } else if (item.type === 'levelup') {
      sfx.play('levelup')
      setOverlays((list) => [...list, item])
    } else if (item.type === 'report') {
      setOverlays((list) => [...list, item])
    }
  }), [showToast])

  // Plansze na cały ekran wstrzymują zegar gry.
  useEffect(() => {
    store.setBlocked(overlays.length > 0 || s.intro)
  }, [overlays.length, s.intro])

  useEffect(() => {
    const mq = window.matchMedia(WIDE)
    const onChange = () => setWide(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Skróty: spacja = pauza, 1/2/3 = prędkość.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'Space') {
        e.preventDefault()
        store.togglePause()
      } else if (e.key === '1') store.setSpeed(1)
      else if (e.key === '2') store.setSpeed(2)
      else if (e.key === '3') store.setSpeed(4)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function navigate(key, section) {
    setTab(key)
    if (section) setBazaSection(section)
    sfx.play('click')
  }

  // --- wysyłka ---
  const dispatchOrder = dispatchId ? s.orders.find((o) => o.id === dispatchId) : null
  let dispatchProps = null
  if (dispatchOrder) {
    const plan = planTrip(s, dispatchOrder, dispatchSel)
    const pending = (id) => s.incoming.filter((x) => x.id === id).reduce((sum, x) => sum + x.qty, 0)
    const toBuy = plan.missing
      .map((m) => ({ id: m.id, qty: m.need - pending(m.id) }))
      .filter((m) => m.qty > 0)
    const missingCost = toBuy.reduce((sum, m) => sum + unitPrice(s, ITEM_BY_ID[m.id]) * m.qty, 0)
    let reason = plan.reason
    if (plan.missing.length && !toBuy.length) reason = 'Towar już jedzie z hurtowni.'
    dispatchProps = {
      order: orderView(s, dispatchOrder),
      vehicles: dispatchVehicles(s, dispatchOrder, dispatchSel),
      plan: {
        ok: plan.ok,
        reason,
        vol: plan.vol,
        cap: plan.cap,
        capOk: plan.cap >= plan.vol,
        time: dispatchSel.length ? fmtDur(plan.minutes) : '—',
        timeOk: !dispatchSel.length || plan.eta <= dispatchOrder.expires,
        deadline: fmtDur(dispatchOrder.expires - s.time),
        fuel: fmtMoney(plan.fuel),
        missingCost: toBuy.length ? fmtMoney(missingCost) : null,
      },
      onBuyMissing: () => {
        let bought = 0
        for (const m of toBuy) if (store.act(buyItem, m.id, m.qty).ok) bought += 1
        if (bought === toBuy.length) showToast('Braki zamówione w hurtowni. Wyślij kurs, gdy dojadą.')
        else {
          sfx.play('error')
          showToast('Nie stać cię na wszystko albo brakuje miejsca w magazynie.')
        }
      },
    }
  }

  function openDispatch(orderId) {
    const order = s.orders.find((o) => o.id === orderId)
    if (!order) return
    setDispatchSel(autoPickVehicles(s, order))
    setDispatchId(orderId)
    sfx.play('click')
  }

  function toggleVehicle(uid) {
    setDispatchSel((sel) => (sel.includes(uid) ? sel.filter((x) => x !== uid) : [...sel, uid]))
  }

  function confirmDispatch() {
    if (act(dispatch, dispatchId, dispatchSel).ok) setDispatchId(null)
  }

  // --- zakupy ---
  const buyIt = buyId ? ITEM_BY_ID[buyId] : null
  let buyProps = null
  if (buyIt) {
    const unit = unitPrice(s, buyIt)
    const byCash = Math.floor(Math.max(0, s.cash) / unit)
    const bySpace = Math.floor(Math.max(0, freeSpace(s)) / buyIt.vol)
    const max = Math.max(0, Math.min(byCash, bySpace, 999))
    let reason = ''
    if (buyQty > byCash) reason = 'Brak gotówki'
    else if (buyQty > bySpace) reason = 'Brak miejsca w magazynie'
    const gear = buyIt.kind === 'gear'
    buyProps = {
      item: {
        icon: buyIt.icon,
        name: buyIt.name,
        have: s.stock[buyIt.id] || 0,
        delivery: fmtDur(deliveryMinutes(s, buyIt)),
        sellPrice: fmtMoney(sellPrice(s, buyIt)),
        facts: [
          { label: 'cena w hurtowni', value: fmtMoney(unit) },
          gear
            ? { label: 'stawka za dobę', value: fmtMoney(buyIt.rent) }
            : { label: 'płaci klient', value: fmtMoney(buyIt.sell) },
          gear
            ? { label: `${buyIt.vol} j.m. · psuje się`, value: `${Math.round(buyIt.dmg * 100)}%` }
            : { label: 'miejsce na sztukę', value: `${buyIt.vol} j.m.` },
        ],
      },
      qty: buyQty,
      max,
      total: fmtMoney(unit * buyQty),
      canBuy: !reason && buyQty > 0,
      reason,
      onMinus: () => setBuyQty((q) => Math.max(1, q - 1)),
      onPlus: () => setBuyQty((q) => q + 1),
      onAdd: (n) => setBuyQty((q) => q + n),
      onMax: () => setBuyQty(Math.max(1, max)),
      onConfirm: () => {
        if (act(buyItem, buyIt.id, buyQty).ok) setBuyId(null)
      },
      onSell: (qty) => act(sellItem, buyIt.id, qty),
    }
  }

  function openBuy(itemId) {
    setBuyQty(1)
    setBuyId(itemId)
    sfx.play('click')
  }

  function fixAll() {
    let started = 0
    const ids = Object.keys(s.faults).sort((a, b) => ITEM_BY_ID[b].price - ITEM_BY_ID[a].price)
    for (const id of ids) {
      while (store.state.faults[id]?.repair > 0 && store.state.repairs.length < repairSlots(store.state)) {
        if (!store.act(startRepair, id).ok) break
        started += 1
      }
    }
    showToast(started ? `Rozpoczęto napraw: ${started}.` : 'Nie udało się zacząć żadnej naprawy.')
    if (!started) sfx.play('error')
  }

  const options = {
    muted,
    onToggleMute: () => {
      sfx.setMuted(!muted)
      setMuted(!muted)
    },
    onExport: async () => {
      try {
        await navigator.clipboard.writeText(store.exportSave())
        showToast('Zapis skopiowany do schowka.')
      } catch {
        showToast('Przeglądarka nie pozwoliła skopiować zapisu.')
      }
    },
    onImport: (code) => showToast(store.importSave(code) ? 'Zapis wczytany.' : 'To nie wygląda na poprawny zapis.'),
    onReset: () => {
      store.reset()
      setTab('pulpit')
      showToast('Nowa gra. Powodzenia, druhu!')
    },
  }

  const w = weatherOf(s)
  const rampCount = s.loans.filter((l) => l.state === 'ramp').length
  const faultCount = Object.values(s.faults).reduce((sum, f) => sum + f.repair + f.broken, 0)
  const nav = [
    { key: 'pulpit', icon: '🏠', label: 'Pulpit' },
    { key: 'zlecenia', icon: '📋', label: 'Zlecenia', badge: s.orders.length },
    { key: 'magazyn', icon: '📦', label: 'Magazyn' },
    { key: 'teren', icon: '🗺️', label: 'Teren', badge: rampCount },
    { key: 'usterki', icon: '🛠️', label: 'Usterki', badge: faultCount },
    { key: 'baza', icon: '🕷️', label: 'Baza', badge: s.perkPoints },
  ]

  const overlay = overlays[0]
  const closeOverlay = () => setOverlays((list) => list.slice(1))
  const event = s.event ? { ...EVENT_BY_ID[s.event.id], result: s.event.result } : null

  return (
    <div className="app-shell">
      <div className="app-frame">
        <Header
          roleLabel={rankName(s.level)}
          today={`Dzień ${dayOf(s.time)}, ${fmtHour(s.time)} ${isNight(s.time) ? '🌙' : w.icon}`}
          roleInitials={s.level}
        />
        <Hud
          cash={s.cash}
          rep={s.rep}
          used={usedSpace(s)}
          cap={capacity(s)}
          level={s.level}
          xp={s.xp}
          xpMax={xpNeed(s.level)}
          speed={s.speed}
          paused={s.paused}
          pops={pops}
          onSpeed={(sp) => store.setSpeed(sp)}
          onPause={() => store.togglePause()}
        />
        {s.paused && <div className="app-paused">PAUZA</div>}

        <div className="app-content">
          {tab === 'pulpit' && (
            <PulpitPage
              s={s}
              onOpenIssue={() => navigate('zlecenia')}
              onGoTeren={() => navigate('teren')}
              onNavigate={navigate}
            />
          )}
          {tab === 'zlecenia' && (
            <ZleceniaPage
              s={s}
              onSend={openDispatch}
              onDismiss={(id) => act(dismissOrder, id)}
              onAccept={(id) => act(acceptContract, id)}
            />
          )}
          {tab === 'magazyn' && <MagazynPage s={s} onBuy={openBuy} />}
          {tab === 'teren' && (
            <TerenPage
              s={s}
              hideMap={wide}
              onReceive={(id) => act(acceptReturn, id)}
              onReceiveAll={() => act(acceptAllReturns)}
            />
          )}
          {tab === 'usterki' && (
            <UsterkiPage
              s={s}
              onFix={(id) => act(startRepair, id)}
              onScrap={(id) => act(scrapItem, id)}
              onFixAll={fixAll}
            />
          )}
          {tab === 'baza' && (
            <BazaPage s={s} act={act} section={bazaSection} onSection={setBazaSection} options={options} />
          )}
        </div>

        <BottomNav items={nav} activeKey={tab} onNavigate={navigate} />
        <Toast message={toast} />

        <DispatchModal
          open={!!dispatchOrder}
          {...dispatchProps}
          onToggle={toggleVehicle}
          onAuto={() => setDispatchSel(autoPickVehicles(s, dispatchOrder))}
          onConfirm={confirmDispatch}
          onClose={() => setDispatchId(null)}
        />
        <BuyModal open={!!buyIt} {...buyProps} onClose={() => setBuyId(null)} />

        <EventModal
          event={event}
          choices={event && !event.result ? eventChoices(s) : []}
          onChoose={(i) => act(chooseEvent, i)}
          onClose={() => act(closeEvent)}
        />

        {overlay && overlay.type === 'levelup' && (
          <Overlay
            icon="🎖️"
            kicker={`POZIOM ${overlay.level}`}
            title={rankName(overlay.level)}
            buttonLabel="Do roboty!"
            confetti
            onClose={closeOverlay}
          >
            <div>
              Premia za awans: <b>{fmtMoney(overlay.bonus)}</b> i 1 punkt sprawności.
            </div>
            <div className="overlay__list">
              {unlocksAt(overlay.level).map((u) => (
                <div key={u.kind + u.name} className="overlay__list-row">
                  <span>
                    {u.icon} {u.name}
                  </span>
                  <span>{u.kind}</span>
                </div>
              ))}
            </div>
          </Overlay>
        )}
        {overlay && overlay.type === 'report' && (
          <Overlay icon="📊" kicker={`RAPORT · TYDZIEŃ ${overlay.week}`} title="Ocena Komendy" buttonLabel="Kolejny tydzień" onClose={closeOverlay}>
            <div className="overlay__grade">{overlay.grade}</div>
            <div className="overlay__list">
              <div className="overlay__list-row"><span>Zlecenia</span><span>{overlay.orders}</span></div>
              <div className="overlay__list-row"><span>Wpływy</span><span>{fmtMoney(overlay.income)}</span></div>
              <div className="overlay__list-row"><span>Wydatki</span><span>{fmtMoney(overlay.expense)}</span></div>
              <div className="overlay__list-row"><span>Wynik tygodnia</span><span>{fmtMoney(overlay.profit)}</span></div>
              <div className="overlay__list-row"><span>Renoma</span><span>{overlay.rep}</span></div>
            </div>
            <div>
              {overlay.bonus > 0
                ? <>Dotacja z Chorągwi za dobry tydzień: <b>{fmtMoney(overlay.bonus)}</b></>
                : 'Tym razem bez dotacji. Tydzień na plusie i renoma 45+ dają ocenę B.'}
            </div>
          </Overlay>
        )}
        {s.intro && (
          <Overlay icon="🕷️" kicker="PAJĄK LOGISTICS" title="Witaj, kwatermistrzu!" buttonLabel="Do roboty!" onClose={() => store.dismissIntro()}>
            <div>
              Dostajesz szopę, taczkę i 600 zł. Podobozy już pytają o koce i menażki — zrób z tej kwaterki imperium logistyczne.
            </div>
            <div className="overlay__list">
              <div className="overlay__list-row"><span>📋 Zlecenia</span><span>wydawaj i wysyłaj kursy</span></div>
              <div className="overlay__list-row"><span>📦 Magazyn</span><span>dokupuj towar w hurtowni</span></div>
              <div className="overlay__list-row"><span>🗺️ Teren</span><span>przyjmuj zwroty z rampy</span></div>
              <div className="overlay__list-row"><span>🛠️ Usterki</span><span>naprawiaj zepsute</span></div>
              <div className="overlay__list-row"><span>🕷️ Baza</span><span>flota, budynki, kadra</span></div>
            </div>
            <div>Spacja zatrzymuje czas, klawisze 1–3 zmieniają tempo.</div>
          </Overlay>
        )}
      </div>

      {wide && <SidePanel s={s} />}
    </div>
  )
}
