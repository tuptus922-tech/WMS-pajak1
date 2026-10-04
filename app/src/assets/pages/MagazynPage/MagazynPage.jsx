import { useState } from 'react';
import SearchInput from '../../components/SearchInput/SearchInput';
import Chip from '../../components/Chip/Chip';
import ItemCard from '../../components/ItemCard/ItemCard';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import EmptyState from '../../components/EmptyState/EmptyState';
import { ITEMS, ITEM_BY_ID, CATEGORIES } from '../../../game/data/items';
import { capacity, usedSpace, outCounts, faultCounts, isItemAvailable } from '../../../game/engine';
import { itemView } from '../../../game/view';
import { fmtDur } from '../../../game/format';
import './MagazynPage.css';

const FILTERS = [{ id: 'all', name: 'Wszystko' }, { id: 'own', name: 'Posiadane' }, ...CATEGORIES];

function lockReason(s, it) {
  if (it.lvl > s.level) return `od poziomu ${it.lvl}`;
  return 'wymaga chłodni';
}

export default function MagazynPage({ s, onBuy }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const out = outCounts(s);
  const bad = faultCounts(s);
  const used = usedSpace(s);
  const cap = capacity(s);
  const q = query.trim().toLowerCase();

  const items = ITEMS.filter((it) => {
    // Zablokowane towary pokazujemy tylko z najbliższych poziomów — jako zapowiedź.
    if (it.lvl > s.level + 2) return false;
    if (q && !it.name.toLowerCase().includes(q)) return false;
    if (activeCategory === 'own') return (s.stock[it.id] || 0) + (out[it.id] || 0) + (bad[it.id] || 0) > 0;
    return activeCategory === 'all' || it.cat === activeCategory;
  })
    .map((it) => itemView(s, it, out, bad, isItemAvailable(s, it) ? null : lockReason(s, it)))
    .sort((a, b) => !!a.locked - !!b.locked);

  return (
    <div className="magazyn-page">
      <div className="magazyn-page__capacity">
        <div className="magazyn-page__capacity-head">
          <span>MIEJSCE W MAGAZYNIE</span>
          <span>
            {used} / {cap} j.m.
          </span>
        </div>
        <ProgressBar value={used} max={cap} tone={used >= cap ? 'orange' : used > cap * 0.85 ? 'amber' : 'green'} />
      </div>

      {s.incoming.length > 0 && (
        <div className="magazyn-page__incoming">
          {s.incoming.map((inc) => (
            <div key={inc.uid} className="magazyn-page__incoming-row">
              <span>
                🚚 {inc.qty}× {ITEM_BY_ID[inc.id].name}
              </span>
              <span>za {fmtDur(inc.at - s.time)}</span>
            </div>
          ))}
        </div>
      )}

      <SearchInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Szukaj, np. lateks…"
      />
      <div className="magazyn-page__chips">
        {FILTERS.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            active={c.id === activeCategory}
            onClick={() => setActiveCategory(c.id)}
          />
        ))}
      </div>
      <div className="magazyn-page__list">
        {items.map((it) => (
          <ItemCard key={it.id} item={it} actionLabel="KUP" onIssue={() => onBuy(it.id)} />
        ))}
        {items.length === 0 && <EmptyState message="Nic tu nie ma. Zmień filtr albo kup coś w hurtowni." />}
      </div>
    </div>
  );
}
